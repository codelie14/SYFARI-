# Guide Technique PostgreSQL - SYFARI

## 📚 Table des matières

1. [Configuration PostgreSQL sur Neon](#configuration-postgresql-sur-neon)
2. [Schéma de base de données](#schéma-de-base-de-données)
3. [Requêtes courantes](#requêtes-courantes)
4. [Optimisation des performances](#optimisation-des-performances)
5. [Sauvegardes et restauration](#sauvegardes-et-restauration)
6. [Bonnes pratiques](#bonnes-pratiques)

---

## 🔧 Configuration PostgreSQL sur Neon

### Étape 1 : Créer un compte Neon

1. Visitez [https://console.neon.tech/](https://console.neon.tech/)
2. Inscrivez-vous avec votre email ou GitHub
3. Vérifiez votre email

### Étape 2 : Créer un nouveau projet

1. Cliquez sur **"New Project"**
2. Donnez un nom à votre projet : **"SYFARI"**
3. Sélectionnez la région : **EU West 2 (London)** (pour l'Afrique)
4. Choisissez PostgreSQL version 15 ou supérieure

### Étape 3 : Obtenir la connexion string

Une fois le projet créé, vous verrez la connexion string :

```
postgresql://user:password@ep-xxx-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Étape 4 : Configurer dans l'application

Ajoutez cette connexion dans votre fichier `.env` :

```env
DATABASE_URL=postgresql://votre_user:votre_password@ep-xxx-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Configuration du pooler

Neon inclut un connection pooler automatique. Configuration recommandée :

```javascript
// lib/db.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,                    // Maximum 20 connexions
  idleTimeoutMillis: 30000,   // Timeout après 30s
  connectionTimeoutMillis: 2000,
});
```

---

## 📊 Schéma de Base de Données

### Diagramme des relations

```
users (1) ─────┬─── (N) groupes (responsable)
               │
               ├─── (N) groupe_membres
               │
               ├─── (N) transactions
               │
               ├─── (N) cotisations
               │
               └─── (N) votes

groupes (1) ───┬─── (N) groupe_membres
               │
               ├─── (N) transactions
               │
               ├─── (N) cotisations
               │
               └─── (N) votes

votes (1) ─────┬─── (N) vote_options
               │
               └─── (N) user_votes
```

### Tables détaillées

#### 1. Table `users`

Stocke les informations des utilisateurs.

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

-- Index pour les recherches rapides
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2. Table `groupes`

Représente les groupes de tontines.

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

-- Index pour les recherches
CREATE INDEX idx_groupes_responsable ON groupes(responsable_id);
CREATE INDEX idx_groupes_statut ON groupes(statut);
CREATE INDEX idx_groupes_date_creation ON groupes(date_creation);
```

#### 3. Table `groupe_membres`

Relation many-to-many entre groupes et utilisateurs.

```sql
CREATE TABLE groupe_membres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id UUID REFERENCES groupes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_adhesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR(20) DEFAULT 'actif',
  UNIQUE(groupe_id, user_id)
);

-- Index pour les recherches
CREATE INDEX idx_groupe_membres_groupe ON groupe_membres(groupe_id);
CREATE INDEX idx_groupe_membres_user ON groupe_membres(user_id);
```

#### 4. Table `transactions`

Historique de toutes les transactions.

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

-- Index pour les recherches fréquentes
CREATE INDEX idx_transactions_groupe ON transactions(groupe_id);
CREATE INDEX idx_transactions_membre ON transactions(membre_id);
CREATE INDEX idx_transactions_date ON transactions(date_transaction);
CREATE INDEX idx_transactions_type ON transactions(type);
```

#### 5. Table `cotisations`

Planification des cotisations.

```sql
CREATE TABLE cotisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id UUID REFERENCES groupes(id) ON DELETE CASCADE,
  membre_id UUID REFERENCES users(id) ON DELETE CASCADE,
  montant DECIMAL(10, 2) NOT NULL,
  date_echeance DATE NOT NULL,
  date_paiement TIMESTAMP,
  statut VARCHAR(20) DEFAULT 'en_attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches
CREATE INDEX idx_cotisations_groupe ON cotisations(groupe_id);
CREATE INDEX idx_cotisations_membre ON cotisations(membre_id);
CREATE INDEX idx_cotisations_statut ON cotisations(statut);
CREATE INDEX idx_cotisations_echeance ON cotisations(date_echeance);
```

#### 6. Table `votes`

Système de vote pour les décisions.

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id UUID REFERENCES groupes(id) ON DELETE CASCADE,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_fin TIMESTAMP NOT NULL,
  statut VARCHAR(20) DEFAULT 'en_cours',
  created_by UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour les recherches
CREATE INDEX idx_votes_groupe ON votes(groupe_id);
CREATE INDEX idx_votes_statut ON votes(statut);
CREATE INDEX idx_votes_date_fin ON votes(date_fin);
```

---

## 🔍 Requêtes Courantes

### 1. Statistiques d'un groupe

```sql
-- Statistiques complètes d'un groupe
SELECT 
  g.nom,
  g.solde,
  COUNT(DISTINCT gm.user_id) as nb_membres,
  COUNT(DISTINCT t.id) as nb_transactions,
  SUM(CASE WHEN t.type = 'cotisation' THEN t.montant ELSE 0 END) as total_cotisations,
  SUM(CASE WHEN t.type = 'retrait' THEN t.montant ELSE 0 END) as total_retraits
FROM groupes g
LEFT JOIN groupe_membres gm ON g.id = gm.groupe_id
LEFT JOIN transactions t ON g.id = t.groupe_id
WHERE g.id = 'groupe_uuid'
GROUP BY g.id, g.nom, g.solde;
```

### 2. Membres en retard de cotisation

```sql
-- Membres avec cotisations en attente
SELECT 
  u.nom,
  u.prenom,
  u.email,
  COUNT(c.id) as nb_cotisations_en_attente,
  SUM(c.montant) as montant_total_du
FROM users u
JOIN cotisations c ON u.id = c.membre_id
WHERE c.statut = 'en_attente' 
  AND c.date_echeance < CURRENT_DATE
GROUP BY u.id, u.nom, u.prenom, u.email;
```

### 3. Transactions d'un mois

```sql
-- Transactions du mois en cours
SELECT 
  t.*,
  u.nom as membre_nom,
  u.prenom as membre_prenom,
  g.nom as groupe_nom
FROM transactions t
JOIN users u ON t.membre_id = u.id
JOIN groupes g ON t.groupe_id = g.id
WHERE DATE_TRUNC('month', t.date_transaction) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY t.date_transaction DESC;
```

### 4. Top contributeurs d'un groupe

```sql
-- Top 10 contributeurs
SELECT 
  u.nom,
  u.prenom,
  COUNT(t.id) as nb_cotisations,
  SUM(t.montant) as montant_total
FROM users u
JOIN transactions t ON u.id = t.membre_id
WHERE t.groupe_id = 'groupe_uuid' 
  AND t.type = 'cotisation'
GROUP BY u.id, u.nom, u.prenom
ORDER BY montant_total DESC
LIMIT 10;
```

### 5. Rapport financier d'un groupe

```sql
-- Rapport financier complet
WITH cotisations_stats AS (
  SELECT 
    groupe_id,
    SUM(montant) as total_cotisations,
    COUNT(*) as nb_cotisations
  FROM transactions
  WHERE type = 'cotisation'
  GROUP BY groupe_id
),
retraits_stats AS (
  SELECT 
    groupe_id,
    SUM(montant) as total_retraits,
    COUNT(*) as nb_retraits
  FROM transactions
  WHERE type = 'retrait'
  GROUP BY groupe_id
)
SELECT 
  g.nom,
  g.solde as solde_actuel,
  COALESCE(c.total_cotisations, 0) as total_cotisations,
  COALESCE(r.total_retraits, 0) as total_retraits,
  COALESCE(c.nb_cotisations, 0) as nb_cotisations,
  COALESCE(r.nb_retraits, 0) as nb_retraits
FROM groupes g
LEFT JOIN cotisations_stats c ON g.id = c.groupe_id
LEFT JOIN retraits_stats r ON g.id = r.groupe_id
WHERE g.id = 'groupe_uuid';
```

---

## ⚡ Optimisation des Performances

### Index recommandés

```sql
-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_groupes_responsable ON groupes(responsable_id);
CREATE INDEX IF NOT EXISTS idx_transactions_groupe_date ON transactions(groupe_id, date_transaction DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_membre_date ON transactions(membre_id, date_transaction DESC);
CREATE INDEX IF NOT EXISTS idx_cotisations_membre_statut ON cotisations(membre_id, statut);
```

### Analyse des requêtes lentes

```sql
-- Activer l'analyse des requêtes (développement uniquement)
EXPLAIN ANALYZE
SELECT * FROM transactions WHERE groupe_id = 'uuid';
```

### Vacuum et maintenance

```sql
-- Nettoyer et optimiser les tables
VACUUM ANALYZE users;
VACUUM ANALYZE groupes;
VACUUM ANALYZE transactions;

-- Statistiques des tables
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

---

## 💾 Sauvegardes et Restauration

### Sauvegardes automatiques avec Neon

Neon effectue automatiquement :
- **Sauvegardes continues** : Point-in-time recovery
- **Snapshots quotidiens** : Conservés pendant 7 jours
- **Réplication** : Données répliquées sur plusieurs zones

### Export manuel

```bash
# Export complet de la base de données
pg_dump "postgresql://user:password@host/database?sslmode=require" > syfari_backup.sql

# Export d'une table spécifique
pg_dump "postgresql://user:password@host/database?sslmode=require" -t users > users_backup.sql

# Export des données uniquement (sans schéma)
pg_dump "postgresql://user:password@host/database?sslmode=require" --data-only > data_backup.sql
```

### Restauration

```bash
# Restauration complète
psql "postgresql://user:password@host/database?sslmode=require" < syfari_backup.sql

# Restauration d'une table
psql "postgresql://user:password@host/database?sslmode=require" < users_backup.sql
```

### Branching avec Neon

Neon permet de créer des branches de votre base de données :

1. Allez dans votre projet Neon
2. Cliquez sur **"Branches"**
3. Créez une nouvelle branche pour tester des changements
4. Une fois validé, fusionnez dans la branche principale

---

## ✅ Bonnes Pratiques

### 1. Utilisation des UUIDs

✅ **Avantages** :
- Pas de collision entre environnements
- Sécurité (pas de séquence prévisible)
- Distribution facile

```javascript
// Génération côté base de données
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

// Pas besoin de générer côté application
```

### 2. Gestion des transactions

```javascript
// Utiliser des transactions pour les opérations critiques
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // Déduire le solde
  await client.query(
    'UPDATE groupes SET solde = solde - $1 WHERE id = $2',
    [montant, groupeId]
  );
  
  // Enregistrer la transaction
  await client.query(
    'INSERT INTO transactions (groupe_id, membre_id, montant, type) VALUES ($1, $2, $3, $4)',
    [groupeId, membreId, montant, 'retrait']
  );
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### 3. Validation des données

```javascript
// Toujours valider avant insertion
if (!email || !email.includes('@')) {
  throw new Error('Email invalide');
}

if (montant <= 0) {
  throw new Error('Montant doit être positif');
}
```

### 4. Pagination

```javascript
// Pour les grandes listes
const limit = 50;
const offset = (page - 1) * limit;

const result = await query(
  'SELECT * FROM transactions ORDER BY date_transaction DESC LIMIT $1 OFFSET $2',
  [limit, offset]
);
```

### 5. Prévention des injections SQL

✅ **Toujours utiliser des paramètres** :

```javascript
// ✅ BON - Utilisation de paramètres
await query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ MAUVAIS - Concaténation de chaînes
await query(`SELECT * FROM users WHERE email = '${email}'`);
```

### 6. Gestion des erreurs

```javascript
try {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  
  if (result.rows.length === 0) {
    return null; // Utilisateur non trouvé
  }
  
  return result.rows[0];
} catch (error) {
  console.error('Erreur base de données:', error);
  throw new Error('Erreur lors de la récupération de l\'utilisateur');
}
```

### 7. Connection pooling

```javascript
// Configuration optimale pour Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,                    // Max connexions
  min: 5,                     // Min connexions
  idleTimeoutMillis: 30000,   // 30 secondes
  connectionTimeoutMillis: 2000,
});
```

---

## 🔐 Sécurité

### Connexion sécurisée

```javascript
// Toujours utiliser SSL avec Neon
ssl: {
  rejectUnauthorized: false
}
```

### Variables d'environnement

```bash
# Ne jamais committer les credentials
# Utiliser des variables d'environnement
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### Permissions

```sql
-- Restreindre les permissions en production
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO syfari_app;
```

---

## 📈 Monitoring

### Requêtes de monitoring

```sql
-- Connexions actives
SELECT count(*) FROM pg_stat_activity;

-- Taille des tables
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Requêtes lentes
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Dashboard Neon

Neon fournit un tableau de bord avec :
- Usage CPU et mémoire
- Nombre de connexions
- Taille de la base de données
- Logs en temps réel

---

## 🚀 Migration et Évolution

### Ajout d'une colonne

```sql
-- Ajouter une colonne avec valeur par défaut
ALTER TABLE users 
ADD COLUMN photo_url VARCHAR(255) DEFAULT NULL;
```

### Modification d'une colonne

```sql
-- Modifier le type d'une colonne
ALTER TABLE transactions 
ALTER COLUMN montant TYPE NUMERIC(15, 2);
```

### Ajout d'un index

```sql
-- Créer un index sans bloquer les lectures
CREATE INDEX CONCURRENTLY idx_users_telephone ON users(telephone);
```

---

## 📞 Support

Pour toute question technique sur PostgreSQL ou Neon :
- Documentation Neon : [https://neon.tech/docs/](https://neon.tech/docs/)
- Support SYFARI : archangeyatte@gmail.com

---

**SYFARI - Gestion digitale des tontines** 🚀
