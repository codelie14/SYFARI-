# SYFARI - Plateforme de Gestion de Tontines

![SYFARI Logo](/assets/img/logo-syfari.jpg)

## 📋 Description

SYFARI est une plateforme SaaS de gestion digitale des tontines et groupes d'épargne collaborative. Elle permet de digitaliser et sécuriser la gestion des tontines en offrant une solution simple, transparente et sécurisée.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités implémentées (MVP)

- **Authentification complète**
  - Inscription avec email/mot de passe
  - Connexion sécurisée avec JWT
  - Gestion de session

- **Gestion des groupes**
  - Création de groupes de tontine
  - Configuration des cotisations (montant, fréquence)
  - Vue détaillée de chaque groupe
  - Statistiques en temps réel (solde, nombre de membres)

- **Gestion des membres**
  - Ajout de membres par email
  - Liste des membres actifs
  - Rôles (responsable, membre)

- **Transactions**
  - Enregistrement des cotisations
  - Gestion des retraits
  - Historique complet des transactions
  - Mise à jour automatique des soldes

- **Tableau de bord**
  - Vue d'ensemble des groupes
  - Solde total
  - Transactions récentes
  - Cotisations en attente

- **Système de vote**
  - Création de votes pour les décisions du groupe
  - Suivi des votes en cours

## 🛠️ Stack Technique

### Frontend
- **Next.js 14** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **Tailwind CSS** - Styling
- **shadcn/ui** - Composants UI
- **Lucide React** - Icônes

### Backend
- **Next.js API Routes** - Backend API
- **PostgreSQL** - Base de données hébergée sur Neon
- **pg** - Driver PostgreSQL
- **bcryptjs** - Hachage des mots de passe
- **jsonwebtoken** - Authentification JWT

## 📦 Installation

### Prérequis
- Node.js 18+
- Yarn
- Compte Neon (pour PostgreSQL)

### Étapes d'installation

1. **Cloner le projet**
```bash
cd /app
```

2. **Installer les dépendances**
```bash
# Avec npm
npm install
```

3. **Configuration de la base de données**

Créez un fichier `.env` à la racine du projet avec votre connexion Neon :

```env
# PostgreSQL sur Neon
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Secret
JWT_SECRET=votre_secret_jwt_securise

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Initialiser la base de données**

Lancez l'application et appelez l'endpoint d'initialisation :

```bash
# Démarrer l'application
yarn dev

# Dans un autre terminal, initialiser la base de données
curl -X GET http://localhost:3000/api/init
```

> Note: Pour que les images et les previews sociales fonctionnent correctement, placez les icônes publiques dans `public/` :

- `public/assets/img/logo-syfari.jpg` (déjà copié)
- `public/favicon.ico` (ajoutez un fichier ICO ou SVG)
- `public/apple-touch-icon.png` (optionnel)

Vous pouvez générer rapidement des icônes via https://realfavicongenerator.net/ et déposer les fichiers dans `public/`.

Cela créera automatiquement toutes les tables nécessaires :
- `users` - Utilisateurs
- `groupes` - Groupes de tontines
- `groupe_membres` - Association groupes/membres
- `transactions` - Historique des transactions
- `cotisations` - Planification des cotisations
- `votes` - Système de vote
- `vote_options` - Options de vote
- `user_votes` - Votes des utilisateurs

5. **Accéder à l'application**

Ouvrez votre navigateur à l'adresse : `http://localhost:3000`

## 🗄️ Structure de la Base de Données

### Table `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'membre',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `groupes`
```sql
CREATE TABLE groupes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  responsable_id UUID REFERENCES users(id) ON DELETE CASCADE,
  montant_cotisation DECIMAL(10, 2) NOT NULL,
  frequence_cotisation VARCHAR(20) NOT NULL,
  solde DECIMAL(10, 2) DEFAULT 0,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR(20) DEFAULT 'actif'
);
```

### Table `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id UUID REFERENCES groupes(id) ON DELETE CASCADE,
  membre_id UUID REFERENCES users(id) ON DELETE CASCADE,
  montant DECIMAL(10, 2) NOT NULL,
  type VARCHAR(20) NOT NULL,
  date_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR(20) DEFAULT 'valide',
  reference_paiement VARCHAR(100),
  description TEXT
);
```

## 🔌 API Endpoints

### Authentification

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nom": "Doe",
  "prenom": "John",
  "telephone": "+225 XX XX XX XX XX"
}
```

#### POST `/api/auth/login`
Connexion
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Groupes

#### GET `/api/groupes`
Liste des groupes de l'utilisateur
*Authentification requise*

#### POST `/api/groupes`
Créer un nouveau groupe
*Authentification requise*
```json
{
  "nom": "Tontine des Amis",
  "description": "Description du groupe",
  "montant_cotisation": 10000,
  "frequence_cotisation": "mensuelle"
}
```

#### GET `/api/groupes/:id`
Détails d'un groupe
*Authentification requise*

#### PUT `/api/groupes/:id`
Modifier un groupe
*Authentification requise (responsable uniquement)*

#### DELETE `/api/groupes/:id`
Supprimer un groupe
*Authentification requise (responsable uniquement)*

### Membres

#### POST `/api/groupes/:id/membres`
Ajouter un membre à un groupe
*Authentification requise (responsable uniquement)*
```json
{
  "email": "membre@example.com"
}
```

#### DELETE `/api/groupes/:id/membres/:userId`
Retirer un membre
*Authentification requise (responsable uniquement)*

### Transactions

#### GET `/api/transactions?groupe_id=xxx`
Liste des transactions d'un groupe
*Authentification requise*

#### POST `/api/transactions`
Créer une transaction
*Authentification requise*
```json
{
  "groupe_id": "uuid",
  "montant": 10000,
  "type": "cotisation",
  "description": "Cotisation du mois"
}
```

### Dashboard

#### GET `/api/dashboard`
Statistiques du tableau de bord
*Authentification requise*

### Votes

#### GET `/api/votes?groupe_id=xxx`
Liste des votes d'un groupe
*Authentification requise*

#### POST `/api/votes`
Créer un vote
*Authentification requise*
```json
{
  "groupe_id": "uuid",
  "titre": "Décision importante",
  "description": "Description du vote",
  "date_fin": "2025-12-31",
  "options": ["Option 1", "Option 2"]
}
```

#### POST `/api/votes/:id/vote`
Voter pour une option
*Authentification requise*
```json
{
  "option_id": "uuid"
}
```

## 🧪 Tests

### Test manuel avec curl

```bash
# 1. Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@syfari.com",
    "password": "test123",
    "nom": "Test",
    "prenom": "User",
    "telephone": "+225 XX XX XX XX"
  }'

# 2. Créer un groupe (avec le token reçu)
curl -X POST http://localhost:3000/api/groupes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nom": "Tontine Test",
    "description": "Groupe de test",
    "montant_cotisation": 5000,
    "frequence_cotisation": "mensuelle"
  }'

# 3. Ajouter une transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "groupe_id": "GROUP_ID",
    "montant": 5000,
    "type": "cotisation",
    "description": "Première cotisation"
  }'

# 4. Voir le dashboard
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔐 Sécurité

- **Mots de passe** : Hachés avec bcrypt (10 rounds)
- **Authentification** : JWT avec expiration de 7 jours
- **Base de données** : Connexion SSL avec Neon
- **Validation** : Validation des données côté serveur
- **Relations** : Contraintes de clés étrangères avec CASCADE

## 📈 Prochaines Étapes

### Intégrations à venir

1. **PayDunya** - Paiements mobile money
   - Orange Money
   - MTN Money
   - Moov Money

2. **Twilio** - Envoi de SMS
   - Rappels de cotisation
   - Notifications importantes

3. **SendGrid** - Envoi d'emails
   - Confirmations
   - Rappels
   - Notifications

### Fonctionnalités futures

- [ ] Système de crédits internes
- [ ] Application mobile (React Native)
- [ ] Génération de rapports PDF
- [ ] Support multilingue (français, dioula, baoulé)
- [ ] Intégration bancaire
- [ ] Audit financier

## 🎨 Design

L'application utilise un design moderne avec :
- Couleurs principales : Orange (#F97316) et Bleu (#1E3A8A)
- Logo SYFARI intégré
- Interface responsive (mobile-first)
- Composants shadcn/ui
- Animations fluides

## 📝 Exemples de Requêtes

### Exemple JavaScript (Frontend)

```javascript
// Connexion
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.user;
};

// Créer un groupe
const createGroupe = async (groupeData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/groupes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(groupeData)
  });
  return await response.json();
};
```

## 🔧 Configuration de Neon

### Création d'un projet sur Neon

1. Allez sur [console.neon.tech](https://console.neon.tech/)
2. Créez un nouveau projet
3. Copiez la connexion string
4. Collez-la dans `.env` comme `DATABASE_URL`

### Optimisations Neon

Neon offre :
- **Autoscaling** : Adaptation automatique aux charges
- **Branching** : Création de branches de base de données
- **Connection pooling** : Gestion optimale des connexions
- **Sauvegardes automatiques** : Protection des données

## 📞 Support

Pour toute question ou problème :
- Email : archangeyatte@gmail.com
- Téléphone : +225 07 11 45 48 41
- Portfolio : [archangeyatte.vercel.app](https://archangeyatte.vercel.app)

## 📄 Licence

Propriété de SYFARI - Tous droits réservés

---

**Développé avec ❤️ par Élie Archange Yatte**
