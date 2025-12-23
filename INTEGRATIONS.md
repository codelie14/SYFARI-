# Guide d'Intégration des Services Externes - SYFARI

Ce document explique comment intégrer les services externes mentionnés dans le cahier des charges : PayDunya, Twilio et SendGrid.

## 📋 Table des matières

1. [Intégration PayDunya](#intégration-paydunya)
2. [Intégration Twilio](#intégration-twilio)
3. [Intégration SendGrid](#intégration-sendgrid)
4. [Automatisation des rappels](#automatisation-des-rappels)

---

## 💳 Intégration PayDunya

PayDunya permet d'accepter les paiements via Orange Money, MTN Money, Moov Money, et cartes bancaires.

### Installation

```bash
yarn add axios
```

### Configuration

Ajoutez vos clés API dans `.env` :

```env
PAYDUNYA_MASTER_KEY=your_master_key
PAYDUNYA_PRIVATE_KEY=your_private_key
PAYDUNYA_PUBLIC_KEY=your_public_key
PAYDUNYA_TOKEN=your_token
PAYDUNYA_MODE=test  # ou 'live' pour la production
```

### Fichier de configuration PayDunya

Créez `/app/lib/paydunya.js` :

```javascript
import axios from 'axios';

const PAYDUNYA_API_URL = process.env.PAYDUNYA_MODE === 'live'
  ? 'https://app.paydunya.com/api/v1'
  : 'https://app.paydunya.com/sandbox-api/v1';

const paydunyaHeaders = {
  'Content-Type': 'application/json',
  'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
  'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
  'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
};

// Créer une facture de paiement
export async function createPaymentInvoice(data) {
  const {
    amount,
    description,
    customer_name,
    customer_email,
    customer_phone,
    callback_url,
    return_url,
  } = data;

  try {
    const response = await axios.post(
      `${PAYDUNYA_API_URL}/checkout-invoice/create`,
      {
        invoice: {
          total_amount: amount,
          description: description,
        },
        store: {
          name: 'SYFARI',
          website: process.env.NEXT_PUBLIC_BASE_URL,
        },
        actions: {
          callback_url: callback_url || `${process.env.NEXT_PUBLIC_BASE_URL}/api/paydunya/callback`,
          return_url: return_url || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        },
        custom_data: data.custom_data || {},
      },
      { headers: paydunyaHeaders }
    );

    return {
      success: true,
      token: response.data.token,
      payment_url: response.data.response_text,
      invoice_url: response.data.invoice_url,
    };
  } catch (error) {
    console.error('Erreur PayDunya:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.response_text || 'Erreur lors de la création de la facture',
    };
  }
}

// Vérifier le statut d'un paiement
export async function checkPaymentStatus(token) {
  try {
    const response = await axios.get(
      `${PAYDUNYA_API_URL}/checkout-invoice/confirm/${token}`,
      { headers: paydunyaHeaders }
    );

    return {
      success: true,
      status: response.data.status, // 'completed', 'pending', 'cancelled'
      customer: response.data.customer,
      transaction_id: response.data.transaction_id,
    };
  } catch (error) {
    console.error('Erreur vérification PayDunya:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Erreur lors de la vérification du paiement',
    };
  }
}

export default { createPaymentInvoice, checkPaymentStatus };
```

### Utilisation dans l'API

Ajoutez dans `/app/app/api/[[...path]]/route.js` :

```javascript
import { createPaymentInvoice, checkPaymentStatus } from '@/lib/paydunya';

// POST /api/payments/create - Créer un paiement
if (endpoint === 'payments/create') {
  const user = getUserFromToken(request);
  if (!user) {
    return errorResponse('Non authentifié', 401);
  }

  const { groupe_id, montant, description } = body;

  if (!groupe_id || !montant) {
    return errorResponse('groupe_id et montant requis');
  }

  // Récupérer les infos du groupe
  const groupeResult = await query('SELECT * FROM groupes WHERE id = $1', [groupe_id]);
  if (groupeResult.rows.length === 0) {
    return errorResponse('Groupe non trouvé', 404);
  }

  // Créer la facture PayDunya
  const paymentData = await createPaymentInvoice({
    amount: montant,
    description: description || `Cotisation - ${groupeResult.rows[0].nom}`,
    customer_name: `${user.prenom} ${user.nom}`,
    customer_email: user.email,
    custom_data: {
      groupe_id: groupe_id,
      membre_id: user.id,
    },
  });

  if (!paymentData.success) {
    return errorResponse(paymentData.error);
  }

  // Enregistrer la transaction en attente
  await query(`
    INSERT INTO transactions (groupe_id, membre_id, montant, type, statut, reference_paiement)
    VALUES ($1, $2, $3, 'cotisation', 'en_attente', $4)
  `, [groupe_id, user.id, montant, paymentData.token]);

  return successResponse({
    payment_url: paymentData.payment_url,
    token: paymentData.token,
  });
}

// POST /api/paydunya/callback - Callback PayDunya
if (endpoint === 'paydunya/callback') {
  const { token, transaction_id } = body;

  // Vérifier le statut du paiement
  const paymentStatus = await checkPaymentStatus(token);

  if (paymentStatus.success && paymentStatus.status === 'completed') {
    // Mettre à jour la transaction
    await query(`
      UPDATE transactions 
      SET statut = 'valide', reference_paiement = $1
      WHERE reference_paiement = $2
    `, [transaction_id, token]);

    // Récupérer la transaction pour mettre à jour le solde
    const transactionResult = await query(
      'SELECT * FROM transactions WHERE reference_paiement = $1',
      [token]
    );

    if (transactionResult.rows.length > 0) {
      const transaction = transactionResult.rows[0];
      await query(
        'UPDATE groupes SET solde = solde + $1 WHERE id = $2',
        [transaction.montant, transaction.groupe_id]
      );
    }

    return successResponse({ message: 'Paiement confirmé' });
  }

  return errorResponse('Paiement non confirmé');
}
```

### Utilisation dans le Frontend

Ajoutez dans `/app/app/page.js` :

```javascript
const initiatePayment = async (groupeId, montant) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        groupe_id: groupeId,
        montant: montant,
        description: 'Cotisation mensuelle'
      })
    });

    const data = await res.json();

    if (res.ok) {
      // Rediriger vers la page de paiement PayDunya
      window.location.href = data.payment_url;
    } else {
      toast.error(data.error || 'Erreur de paiement');
    }
  } catch (error) {
    toast.error('Erreur de connexion');
  }
};
```

---

## 📱 Intégration Twilio

Twilio permet d'envoyer des SMS de rappel aux membres.

### Installation

```bash
yarn add twilio
```

### Configuration

Ajoutez dans `.env` :

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Fichier de configuration Twilio

Créez `/app/lib/twilio.js` :

```javascript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Envoyer un SMS
export async function sendSMS(to, message) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log('SMS envoyé:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
    return { success: false, error: error.message };
  }
}

// Envoyer un rappel de cotisation
export async function sendCotisationReminder(membre, groupe, montant, dateEcheance) {
  const message = `
Bonjour ${membre.prenom},

Rappel : Votre cotisation de ${montant} F CFA pour le groupe "${groupe.nom}" est due le ${new Date(dateEcheance).toLocaleDateString('fr-FR')}.

Merci de procéder au paiement.

SYFARI - Gestion de tontines
  `.trim();

  return await sendSMS(membre.telephone, message);
}

// Notifier un retrait
export async function notifyWithdrawal(responsable, groupe, montant, membre) {
  const message = `
Alerte SYFARI

Un retrait de ${montant} F CFA a été effectué par ${membre.prenom} ${membre.nom} du groupe "${groupe.nom}".

Nouveau solde: ${groupe.solde} F CFA
  `.trim();

  return await sendSMS(responsable.telephone, message);
}

export default { sendSMS, sendCotisationReminder, notifyWithdrawal };
```

### Utilisation dans l'API

```javascript
import { sendCotisationReminder, notifyWithdrawal } from '@/lib/twilio';

// POST /api/notifications/send-reminders - Envoyer des rappels
if (endpoint === 'notifications/send-reminders') {
  const user = getUserFromToken(request);
  if (!user) {
    return errorResponse('Non authentifié', 401);
  }

  // Récupérer les cotisations en attente
  const cotisationsResult = await query(`
    SELECT c.*, u.prenom, u.nom, u.telephone, g.nom as groupe_nom, g.montant_cotisation
    FROM cotisations c
    JOIN users u ON c.membre_id = u.id
    JOIN groupes g ON c.groupe_id = g.id
    WHERE c.statut = 'en_attente' 
      AND c.date_echeance <= CURRENT_DATE + INTERVAL '3 days'
      AND g.responsable_id = $1
  `, [user.id]);

  let sentCount = 0;
  for (const cotisation of cotisationsResult.rows) {
    const result = await sendCotisationReminder(
      { prenom: cotisation.prenom, telephone: cotisation.telephone },
      { nom: cotisation.groupe_nom },
      cotisation.montant_cotisation,
      cotisation.date_echeance
    );

    if (result.success) {
      sentCount++;
    }
  }

  return successResponse({ 
    message: `${sentCount} rappels envoyés`,
    total: cotisationsResult.rows.length 
  });
}
```

---

## 📧 Intégration SendGrid

SendGrid pour l'envoi d'emails professionnels.

### Installation

```bash
yarn add @sendgrid/mail
```

### Configuration

Ajoutez dans `.env` :

```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@syfari.com
SENDGRID_FROM_NAME=SYFARI
```

### Fichier de configuration SendGrid

Créez `/app/lib/sendgrid.js` :

```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Envoyer un email
export async function sendEmail({ to, subject, html, text }) {
  try {
    const msg = {
      to: to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME,
      },
      subject: subject,
      text: text,
      html: html,
    };

    await sgMail.send(msg);
    console.log('Email envoyé à:', to);
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
}

// Email de bienvenue
export async function sendWelcomeEmail(user) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #f97316, #ea580c); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">Bienvenue sur SYFARI !</h1>
      </div>
      <div style="padding: 40px; background: #f9fafb;">
        <p>Bonjour ${user.prenom} ${user.nom},</p>
        <p>Nous sommes ravis de vous accueillir sur SYFARI, la plateforme de gestion de tontines la plus simple et sécurisée.</p>
        <p>Vous pouvez maintenant :</p>
        <ul>
          <li>Créer des groupes de tontine</li>
          <li>Inviter des membres</li>
          <li>Gérer les cotisations</li>
          <li>Suivre les transactions en temps réel</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
             style="background: #f97316; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Accéder à mon compte
          </a>
        </div>
        <p>À très bientôt,<br/>L'équipe SYFARI</p>
      </div>
      <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
        <p>© 2025 SYFARI - Tous droits réservés</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Bienvenue sur SYFARI !',
    html: html,
    text: `Bienvenue ${user.prenom} sur SYFARI !`,
  });
}

// Email de rappel de cotisation
export async function sendCotisationReminderEmail(user, groupe, montant, dateEcheance) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f97316; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rappel de Cotisation</h1>
      </div>
      <div style="padding: 40px; background: #f9fafb;">
        <p>Bonjour ${user.prenom},</p>
        <p>Nous vous rappelons que votre cotisation pour le groupe <strong>${groupe.nom}</strong> est due.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Montant :</strong> ${montant.toLocaleString()} F CFA</p>
          <p style="margin: 5px 0;"><strong>Date d'échéance :</strong> ${new Date(dateEcheance).toLocaleDateString('fr-FR')}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/groupes/${groupe.id}" 
             style="background: #f97316; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Effectuer le paiement
          </a>
        </div>
        <p>Merci,<br/>L'équipe SYFARI</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Rappel de cotisation - ${groupe.nom}`,
    html: html,
    text: `Rappel : Votre cotisation de ${montant} F CFA pour ${groupe.nom} est due le ${new Date(dateEcheance).toLocaleDateString('fr-FR')}.`,
  });
}

export default { sendEmail, sendWelcomeEmail, sendCotisationReminderEmail };
```

### Utilisation dans l'API

```javascript
import { sendWelcomeEmail } from '@/lib/sendgrid';

// Lors de l'inscription
if (endpoint === 'auth/register') {
  // ... code d'inscription existant ...
  
  const user = await createUser({ email, password, nom, prenom, telephone });
  
  // Envoyer l'email de bienvenue
  await sendWelcomeEmail(user);
  
  const token = generateToken(user);
  return successResponse({ user, token }, 201);
}
```

---

## ⏰ Automatisation des Rappels

Pour automatiser l'envoi des rappels, vous pouvez utiliser un cron job.

### Option 1 : Cron externe (Recommandé pour la production)

Utilisez un service comme [cron-job.org](https://cron-job.org) ou [EasyCron](https://www.easycron.com/) qui appellera votre endpoint `/api/notifications/send-reminders` tous les jours.

### Option 2 : Script Node.js local

Créez `/app/scripts/send-reminders.js` :

```javascript
import { query } from '../lib/db.js';
import { sendCotisationReminder } from '../lib/twilio.js';
import { sendCotisationReminderEmail } from '../lib/sendgrid.js';

async function sendDailyReminders() {
  console.log('Envoi des rappels quotidiens...');

  // Récupérer les cotisations en attente
  const result = await query(`
    SELECT c.*, u.prenom, u.nom, u.email, u.telephone, 
           g.nom as groupe_nom, g.montant_cotisation
    FROM cotisations c
    JOIN users u ON c.membre_id = u.id
    JOIN groupes g ON c.groupe_id = g.id
    WHERE c.statut = 'en_attente' 
      AND c.date_echeance = CURRENT_DATE + INTERVAL '1 day'
  `);

  console.log(`${result.rows.length} rappels à envoyer`);

  for (const cotisation of result.rows) {
    // Envoyer SMS
    await sendCotisationReminder(
      { prenom: cotisation.prenom, telephone: cotisation.telephone },
      { nom: cotisation.groupe_nom },
      cotisation.montant_cotisation,
      cotisation.date_echeance
    );

    // Envoyer Email
    await sendCotisationReminderEmail(
      { prenom: cotisation.prenom, email: cotisation.email },
      { nom: cotisation.groupe_nom, id: cotisation.groupe_id },
      cotisation.montant_cotisation,
      cotisation.date_echeance
    );
  }

  console.log('Rappels envoyés avec succès');
  process.exit(0);
}

sendDailyReminders();
```

Ajoutez dans `package.json` :

```json
{
  "scripts": {
    "send-reminders": "node scripts/send-reminders.js"
  }
}
```

Créez un cron job système :

```bash
# Éditer crontab
crontab -e

# Ajouter (exécute tous les jours à 9h)
0 9 * * * cd /app && yarn send-reminders
```

---

## 🔒 Sécurité des Clés API

### Ne jamais exposer les clés

✅ Toujours utiliser des variables d'environnement
❌ Jamais dans le code source
❌ Jamais committer dans Git

### Fichier `.gitignore`

```
.env
.env.local
.env.production
```

### Rotation des clés

Changez régulièrement vos clés API pour plus de sécurité.

---

## 📞 Support

Pour toute question sur ces intégrations :
- PayDunya : [https://developer.paydunya.com/](https://developer.paydunya.com/)
- Twilio : [https://www.twilio.com/docs](https://www.twilio.com/docs)
- SendGrid : [https://docs.sendgrid.com/](https://docs.sendgrid.com/)

---

**SYFARI - Plateforme complète de gestion de tontines** 🚀
