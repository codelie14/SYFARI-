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
    const body = await request.json();

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
