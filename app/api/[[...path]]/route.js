import { NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { 
  createUser, 
  getUserByEmail, 
  getUserById,
  comparePassword, 
  generateToken, 
  getUserFromToken 
} from '@/lib/auth';

// Initialiser la base de données au démarrage
let dbInitialized = false;

const ensureDbInitialized = async () => {
  const state = globalThis.__syfariDbInitState || { initialized: false, initializing: null };
  globalThis.__syfariDbInitState = state;

  if (state.initialized || dbInitialized) return;

  if (!state.initializing) {
    state.initializing = initDatabase().then(() => {
      state.initialized = true;
      dbInitialized = true;
    }).finally(() => {
      state.initializing = null;
    });
  }

  await state.initializing;
};

const getBaseUrl = (request) => {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, '');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  if (!host) return 'http://localhost:3000';
  return `${proto}://${host}`;
};

const getPaydunyaApiBaseUrl = () => {
  const mode = (process.env.PAYDUNYA_MODE || 'test').toLowerCase();
  return mode === 'live'
    ? 'https://app.paydunya.com/api/v1'
    : 'https://app.paydunya.com/sandbox-api/v1';
};

const getPaydunyaHeaders = () => {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;
  return {
    'Content-Type': 'application/json',
    'PAYDUNYA-MASTER-KEY': masterKey,
    'PAYDUNYA-PRIVATE-KEY': privateKey,
    'PAYDUNYA-TOKEN': token,
  };
};

const paydunyaFetch = async (path, { method = 'GET', body } = {}) => {
  const headers = getPaydunyaHeaders();
  if (!headers['PAYDUNYA-MASTER-KEY'] || !headers['PAYDUNYA-PRIVATE-KEY'] || !headers['PAYDUNYA-TOKEN']) {
    throw new Error('Clés PayDunya manquantes dans .env');
  }
  const res = await fetch(`${getPaydunyaApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.response_text || data?.message || 'Erreur PayDunya';
    throw new Error(msg);
  }
  return data;
};

const getPlanPricing = (planId) => {
  const prices = {
    basique: 2000,
    standard: 5000,
    premium: 10000,
  };
  const amount = prices[planId];
  if (!amount) return null;
  return { amount, currency: 'XOF' };
};

// Helper pour les réponses d'erreur
const errorResponse = (message, status = 400) => {
  return NextResponse.json({ error: message }, { status });
};

// Helper pour les réponses de succès
const successResponse = (data, status = 200) => {
  return NextResponse.json(data, { status });
};

// Route handler principal
export async function GET(request, { params }) {
  await ensureDbInitialized();
  
  const path = params?.path || [];
  const endpoint = path.join('/');
  const { searchParams } = new URL(request.url);

  try {
    // GET /api/init - Initialiser la base de données
    if (endpoint === 'init') {
      await initDatabase();
      const state = globalThis.__syfariDbInitState || { initialized: false, initializing: null };
      state.initialized = true;
      state.initializing = null;
      globalThis.__syfariDbInitState = state;
      dbInitialized = true;
      return successResponse({ message: 'Base de données initialisée avec succès' });
    }

    // GET /api/user - Obtenir l'utilisateur connecté
    if (endpoint === 'user') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }
      const userData = await getUserById(user.id);
      return successResponse(userData);
    }

    // GET /api/payments/status?token=... - Vérifier un paiement PayDunya
    if (endpoint === 'payments/status') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const token = searchParams.get('token');
      if (!token) {
        return errorResponse('token requis', 400);
      }

      const paymentRes = await query(
        'SELECT * FROM payments WHERE provider = $1 AND provider_token = $2',
        ['paydunya', token]
      );
      if (paymentRes.rows.length === 0) {
        return errorResponse('Paiement introuvable', 404);
      }
      const payment = paymentRes.rows[0];
      if (payment.user_id !== user.id) {
        return errorResponse('Non autorisé', 403);
      }

      const confirm = await paydunyaFetch(`/checkout-invoice/confirm/${encodeURIComponent(token)}`);
      const status = (confirm?.status || confirm?.data?.status || '').toUpperCase();
      const normalized = status || 'PENDING';
      const transactionId = confirm?.transaction_id || confirm?.data?.transaction_id || null;

      await query(
        `UPDATE payments
         SET status = $1, transaction_id = COALESCE($2, transaction_id), updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [normalized, transactionId, payment.id]
      );

      if (normalized === 'COMPLETED') {
        await query('UPDATE users SET plan = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [payment.plan_id, user.id]);
      }

      return successResponse({
        status: normalized,
        plan_id: payment.plan_id,
        amount: payment.amount,
        transaction_id: transactionId,
      });
    }

    // GET /api/groupes - Liste des groupes
    if (endpoint === 'groupes') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const result = await query(`
        SELECT g.*, u.nom as responsable_nom, u.prenom as responsable_prenom,
               (SELECT COUNT(*) FROM groupe_membres WHERE groupe_id = g.id) as nb_membres
        FROM groupes g
        LEFT JOIN users u ON g.responsable_id = u.id
        WHERE g.responsable_id = $1 
           OR g.id IN (SELECT groupe_id FROM groupe_membres WHERE user_id = $1)
        ORDER BY g.date_creation DESC
      `, [user.id]);

      return successResponse(result.rows);
    }

    // GET /api/groupes/:id - Détails d'un groupe
    if (endpoint.startsWith('groupes/') && path.length === 2) {
      const groupeId = path[1];
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const groupeResult = await query(`
        SELECT g.*, u.nom as responsable_nom, u.prenom as responsable_prenom, u.email as responsable_email
        FROM groupes g
        LEFT JOIN users u ON g.responsable_id = u.id
        WHERE g.id = $1
      `, [groupeId]);

      if (groupeResult.rows.length === 0) {
        return errorResponse('Groupe non trouvé', 404);
      }

      const membresResult = await query(`
        SELECT u.id, u.nom, u.prenom, u.email, u.telephone, gm.date_adhesion, gm.statut
        FROM groupe_membres gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.groupe_id = $1
        ORDER BY gm.date_adhesion ASC
      `, [groupeId]);

      const groupe = groupeResult.rows[0];
      groupe.membres = membresResult.rows;

      return successResponse(groupe);
    }

    // GET /api/transactions - Liste des transactions
    if (endpoint === 'transactions') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const groupeId = searchParams.get('groupe_id');
      let sqlQuery = `
        SELECT t.*, u.nom as membre_nom, u.prenom as membre_prenom, g.nom as groupe_nom
        FROM transactions t
        LEFT JOIN users u ON t.membre_id = u.id
        LEFT JOIN groupes g ON t.groupe_id = g.id
        WHERE 1=1
      `;
      const params = [];

      if (groupeId) {
        params.push(groupeId);
        sqlQuery += ` AND t.groupe_id = $${params.length}`;
      }

      sqlQuery += ' ORDER BY t.date_transaction DESC LIMIT 100';

      const result = await query(sqlQuery, params);
      return successResponse(result.rows);
    }

    // GET /api/dashboard - Statistiques du tableau de bord
    if (endpoint === 'dashboard') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      // Nombre de groupes
      const groupesCount = await query(`
        SELECT COUNT(*) as count FROM groupes 
        WHERE responsable_id = $1 
           OR id IN (SELECT groupe_id FROM groupe_membres WHERE user_id = $1)
      `, [user.id]);

      // Solde total
      const soldeTotal = await query(`
        SELECT COALESCE(SUM(solde), 0) as total FROM groupes 
        WHERE responsable_id = $1
      `, [user.id]);

      // Transactions récentes
      const transactionsRecentes = await query(`
        SELECT t.*, g.nom as groupe_nom, u.nom as membre_nom, u.prenom as membre_prenom
        FROM transactions t
        LEFT JOIN groupes g ON t.groupe_id = g.id
        LEFT JOIN users u ON t.membre_id = u.id
        WHERE t.membre_id = $1 OR g.responsable_id = $1
        ORDER BY t.date_transaction DESC
        LIMIT 5
      `, [user.id]);

      // Cotisations en attente
      const cotisationsEnAttente = await query(`
        SELECT COUNT(*) as count FROM cotisations 
        WHERE membre_id = $1 AND statut = 'en_attente'
      `, [user.id]);

      return successResponse({
        nb_groupes: parseInt(groupesCount.rows[0].count),
        solde_total: parseFloat(soldeTotal.rows[0].total),
        transactions_recentes: transactionsRecentes.rows,
        cotisations_en_attente: parseInt(cotisationsEnAttente.rows[0].count)
      });
    }

    // GET /api/votes - Liste des votes
    if (endpoint === 'votes') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const groupeId = searchParams.get('groupe_id');
      if (!groupeId) {
        return errorResponse('groupe_id requis', 400);
      }

      const result = await query(`
        SELECT v.*, 
               (SELECT COUNT(*) FROM user_votes WHERE vote_id = v.id) as total_votes,
               (SELECT COUNT(*) FROM user_votes WHERE vote_id = v.id AND user_id = $2) as user_voted
        FROM votes v
        WHERE v.groupe_id = $1
        ORDER BY v.date_debut DESC
      `, [groupeId, user.id]);

      return successResponse(result.rows);
    }

    return errorResponse('Endpoint non trouvé', 404);

  } catch (error) {
    console.error('Erreur GET:', error);
    return errorResponse(error.message, 500);
  }
}

export async function POST(request, { params }) {
  await ensureDbInitialized();
  
  const path = params?.path || [];
  const endpoint = path.join('/');

  try {
    const contentType = request.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await request.json()
      : Object.fromEntries(new URLSearchParams(await request.text()));

    // POST /api/paydunya/callback - Callback PayDunya (IPN)
    if (endpoint === 'paydunya/callback') {
      const token =
        body['data[token]'] ||
        body['token'] ||
        body['data']?.token ||
        null;

      if (!token) {
        return errorResponse('token requis', 400);
      }

      const paymentRes = await query(
        'SELECT * FROM payments WHERE provider = $1 AND provider_token = $2',
        ['paydunya', token]
      );
      if (paymentRes.rows.length === 0) {
        return errorResponse('Paiement introuvable', 404);
      }
      const payment = paymentRes.rows[0];

      const confirm = await paydunyaFetch(`/checkout-invoice/confirm/${encodeURIComponent(token)}`);
      const status = (confirm?.status || confirm?.data?.status || '').toUpperCase();
      const normalized = status || 'PENDING';
      const transactionId = confirm?.transaction_id || confirm?.data?.transaction_id || null;

      await query(
        `UPDATE payments
         SET status = $1, transaction_id = COALESCE($2, transaction_id), updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [normalized, transactionId, payment.id]
      );

      if (normalized === 'COMPLETED') {
        await query(
          'UPDATE users SET plan = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [payment.plan_id, payment.user_id]
        );
      }

      return successResponse({ message: 'Callback reçu', status: normalized });
    }

    // POST /api/payments/checkout - Créer une facture PayDunya
    if (endpoint === 'payments/checkout') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const { plan_id, next } = body;
      const pricing = getPlanPricing(plan_id);
      if (!plan_id || !pricing) {
        return errorResponse('plan_id invalide');
      }

      const baseUrl = getBaseUrl(request);
      const nextPath = typeof next === 'string' && next.startsWith('/') ? next : '/dashboard';

      const invoice = await paydunyaFetch('/checkout-invoice/create', {
        method: 'POST',
        body: {
          invoice: {
            total_amount: pricing.amount,
            description: `Abonnement SYFARI - ${plan_id}`,
            customer: {
              name: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email,
              email: user.email,
            },
          },
          store: {
            name: 'SYFARI',
            website_url: baseUrl,
          },
          actions: {
            callback_url: `${baseUrl}/api/paydunya/callback`,
            return_url: `${baseUrl}/pricing?payment=success&next=${encodeURIComponent(nextPath)}`,
            cancel_url: `${baseUrl}/pricing?payment=cancel&next=${encodeURIComponent(nextPath)}`,
          },
          custom_data: {
            user_id: user.id,
            plan_id,
          },
        },
      });

      const responseCode = invoice?.response_code;
      const token = invoice?.token;
      const invoiceUrl = invoice?.response_text || invoice?.invoice_url;
      if (responseCode !== '00' || !token || !invoiceUrl) {
        return errorResponse(invoice?.response_text || 'Erreur lors de la création de la facture');
      }

      await query(
        `INSERT INTO payments (user_id, plan_id, amount, provider, provider_token, status)
         VALUES ($1, $2, $3, 'paydunya', $4, 'PENDING')
         ON CONFLICT (provider_token) DO UPDATE
         SET plan_id = EXCLUDED.plan_id, amount = EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP`,
        [user.id, plan_id, pricing.amount, token]
      );

      return successResponse({ token, invoice_url: invoiceUrl });
    }

    // POST /api/auth/register - Inscription
    if (endpoint === 'auth/register') {
      const { email, password, nom, prenom, telephone } = body;

      if (!email || !password || !nom || !prenom) {
        return errorResponse('Tous les champs sont requis');
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return errorResponse('Cet email est déjà utilisé');
      }

      const user = await createUser({ email, password, nom, prenom, telephone });
      const token = generateToken(user);

      return successResponse({ user, token }, 201);
    }

    // POST /api/auth/login - Connexion
    if (endpoint === 'auth/login') {
      const { email, password } = body;

      if (!email || !password) {
        return errorResponse('Email et mot de passe requis');
      }

      const user = await getUserByEmail(email);
      if (!user) {
        return errorResponse('Email ou mot de passe incorrect');
      }

      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        return errorResponse('Email ou mot de passe incorrect');
      }

      const { password_hash, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);

      return successResponse({ user: userWithoutPassword, token });
    }

    // POST /api/groupes - Créer un groupe
    if (endpoint === 'groupes') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const { nom, description, montant_cotisation, frequence_cotisation } = body;

      if (!nom || !montant_cotisation || !frequence_cotisation) {
        return errorResponse('Nom, montant et fréquence requis');
      }

      const result = await query(`
        INSERT INTO groupes (nom, description, responsable_id, montant_cotisation, frequence_cotisation)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [nom, description, user.id, montant_cotisation, frequence_cotisation]);

      // Ajouter le responsable comme membre
      await query(`
        INSERT INTO groupe_membres (groupe_id, user_id)
        VALUES ($1, $2)
      `, [result.rows[0].id, user.id]);

      return successResponse(result.rows[0], 201);
    }

    // POST /api/groupes/:id/membres - Ajouter un membre
    if (endpoint.match(/^groupes\/[^/]+\/membres$/)) {
      const groupeId = path[1];
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const { email } = body;
      if (!email) {
        return errorResponse('Email requis');
      }

      // Trouver l'utilisateur
      const membre = await getUserByEmail(email);
      if (!membre) {
        return errorResponse('Utilisateur non trouvé');
      }

      // Vérifier que l'utilisateur est le responsable
      const groupeResult = await query(
        'SELECT * FROM groupes WHERE id = $1 AND responsable_id = $2',
        [groupeId, user.id]
      );

      if (groupeResult.rows.length === 0) {
        return errorResponse('Vous n\'êtes pas le responsable de ce groupe', 403);
      }

      // Ajouter le membre
      try {
        const result = await query(`
          INSERT INTO groupe_membres (groupe_id, user_id)
          VALUES ($1, $2)
          RETURNING *
        `, [groupeId, membre.id]);

        return successResponse({ message: 'Membre ajouté avec succès', membre: result.rows[0] }, 201);
      } catch (error) {
        if (error.code === '23505') { // Contrainte unique
          return errorResponse('Ce membre fait déjà partie du groupe');
        }
        throw error;
      }
    }

    // POST /api/transactions - Créer une transaction
    if (endpoint === 'transactions') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const { groupe_id, montant, type, description } = body;

      if (!groupe_id || !montant || !type) {
        return errorResponse('groupe_id, montant et type requis');
      }

      // Créer la transaction
      const result = await query(`
        INSERT INTO transactions (groupe_id, membre_id, montant, type, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [groupe_id, user.id, montant, type, description]);

      // Mettre à jour le solde du groupe
      if (type === 'cotisation') {
        await query(`
          UPDATE groupes SET solde = solde + $1 WHERE id = $2
        `, [montant, groupe_id]);
      } else if (type === 'retrait') {
        await query(`
          UPDATE groupes SET solde = solde - $1 WHERE id = $2
        `, [montant, groupe_id]);
      }

      return successResponse(result.rows[0], 201);
    }

    // POST /api/votes - Créer un vote
    if (endpoint === 'votes') {
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const { groupe_id, titre, description, date_fin, options } = body;

      if (!groupe_id || !titre || !date_fin || !options || options.length < 2) {
        return errorResponse('Données incomplètes pour créer un vote');
      }

      // Créer le vote
      const voteResult = await query(`
        INSERT INTO votes (groupe_id, titre, description, date_fin, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [groupe_id, titre, description, date_fin, user.id]);

      const voteId = voteResult.rows[0].id;

      // Créer les options
      for (const option of options) {
        await query(`
          INSERT INTO vote_options (vote_id, option_text)
          VALUES ($1, $2)
        `, [voteId, option]);
      }

      return successResponse(voteResult.rows[0], 201);
    }

    // POST /api/votes/:id/vote - Voter
    if (endpoint.match(/^votes\/[^/]+\/vote$/)) {
      const voteId = path[1];
      const user = getUserFromToken(request);
      if (!user) {
        return errorResponse('Non authentifié', 401);
      }

      const { option_id } = body;
      if (!option_id) {
        return errorResponse('option_id requis');
      }

      try {
        // Enregistrer le vote
        await query(`
          INSERT INTO user_votes (vote_id, user_id, option_id)
          VALUES ($1, $2, $3)
        `, [voteId, user.id, option_id]);

        // Incrémenter le compteur
        await query(`
          UPDATE vote_options SET nb_votes = nb_votes + 1 WHERE id = $1
        `, [option_id]);

        return successResponse({ message: 'Vote enregistré avec succès' });
      } catch (error) {
        if (error.code === '23505') {
          return errorResponse('Vous avez déjà voté');
        }
        throw error;
      }
    }

    return errorResponse('Endpoint non trouvé', 404);

  } catch (error) {
    console.error('Erreur POST:', error);
    return errorResponse(error.message, 500);
  }
}

export async function PUT(request, { params }) {
  await ensureDbInitialized();
  
  const path = params?.path || [];
  const endpoint = path.join('/');

  try {
    const body = await request.json();
    const user = getUserFromToken(request);
    if (!user) {
      return errorResponse('Non authentifié', 401);
    }

    // PUT /api/user - Mettre à jour le profil
    if (endpoint === 'user') {
      const { prenom, nom, email, telephone } = body;

      try {
        const result = await query(
          `UPDATE users
           SET prenom = COALESCE($1, prenom),
               nom = COALESCE($2, nom),
               email = COALESCE($3, email),
               telephone = COALESCE($4, telephone),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $5
           RETURNING id, email, nom, prenom, telephone, plan, role, created_at`,
          [prenom, nom, email, telephone, user.id]
        );

        return successResponse(result.rows[0]);
      } catch (error) {
        if (error.code === '23505') {
          return errorResponse('Cet email est déjà utilisé', 409);
        }
        throw error;
      }
    }

    // PUT /api/groupes/:id - Modifier un groupe
    if (endpoint.match(/^groupes\/[^/]+$/) && path.length === 2) {
      const groupeId = path[1];
      const { nom, description, montant_cotisation, frequence_cotisation } = body;

      const result = await query(`
        UPDATE groupes 
        SET nom = COALESCE($1, nom),
            description = COALESCE($2, description),
            montant_cotisation = COALESCE($3, montant_cotisation),
            frequence_cotisation = COALESCE($4, frequence_cotisation)
        WHERE id = $5 AND responsable_id = $6
        RETURNING *
      `, [nom, description, montant_cotisation, frequence_cotisation, groupeId, user.id]);

      if (result.rows.length === 0) {
        return errorResponse('Groupe non trouvé ou non autorisé', 404);
      }

      return successResponse(result.rows[0]);
    }

    return errorResponse('Endpoint non trouvé', 404);

  } catch (error) {
    console.error('Erreur PUT:', error);
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  await ensureDbInitialized();
  
  const path = params?.path || [];
  const endpoint = path.join('/');

  try {
    const user = getUserFromToken(request);
    if (!user) {
      return errorResponse('Non authentifié', 401);
    }

    // DELETE /api/groupes/:id - Supprimer un groupe
    if (endpoint.match(/^groupes\/[^/]+$/) && path.length === 2) {
      const groupeId = path[1];

      const result = await query(`
        DELETE FROM groupes WHERE id = $1 AND responsable_id = $2
        RETURNING *
      `, [groupeId, user.id]);

      if (result.rows.length === 0) {
        return errorResponse('Groupe non trouvé ou non autorisé', 404);
      }

      return successResponse({ message: 'Groupe supprimé avec succès' });
    }

    // DELETE /api/groupes/:id/membres/:userId - Retirer un membre
    if (endpoint.match(/^groupes\/[^/]+\/membres\/[^/]+$/)) {
      const groupeId = path[1];
      const userId = path[3];

      // Vérifier que l'utilisateur est le responsable
      const groupeResult = await query(
        'SELECT * FROM groupes WHERE id = $1 AND responsable_id = $2',
        [groupeId, user.id]
      );

      if (groupeResult.rows.length === 0) {
        return errorResponse('Non autorisé', 403);
      }

      await query(`
        DELETE FROM groupe_membres WHERE groupe_id = $1 AND user_id = $2
      `, [groupeId, userId]);

      return successResponse({ message: 'Membre retiré avec succès' });
    }

    return errorResponse('Endpoint non trouvé', 404);

  } catch (error) {
    console.error('Erreur DELETE:', error);
    return errorResponse(error.message, 500);
  }
}
