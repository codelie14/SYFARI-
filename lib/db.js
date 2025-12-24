import { Pool } from 'pg';

let pool;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
};

export const query = async (text, params) => {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' && process.env.DB_LOG_QUERIES === '1') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const initDatabase = async () => {
  const pool = getPool();
  
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    // Table users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20),
        plan VARCHAR(20),
        role VARCHAR(20) DEFAULT 'membre',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(20)');

    // Table groupes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS groupes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nom VARCHAR(100) NOT NULL,
        description TEXT,
        responsable_id UUID REFERENCES users(id) ON DELETE CASCADE,
        montant_cotisation DECIMAL(10, 2) NOT NULL,
        frequence_cotisation VARCHAR(20) NOT NULL,
        solde DECIMAL(10, 2) DEFAULT 0,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        statut VARCHAR(20) DEFAULT 'actif'
      )
    `);

    // Table groupe_membres
    await pool.query(`
      CREATE TABLE IF NOT EXISTS groupe_membres (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        groupe_id UUID REFERENCES groupes(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date_adhesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        statut VARCHAR(20) DEFAULT 'actif',
        UNIQUE(groupe_id, user_id)
      )
    `);

    // Table transactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        groupe_id UUID REFERENCES groupes(id) ON DELETE CASCADE,
        membre_id UUID REFERENCES users(id) ON DELETE CASCADE,
        montant DECIMAL(10, 2) NOT NULL,
        type VARCHAR(20) NOT NULL,
        date_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        statut VARCHAR(20) DEFAULT 'valide',
        reference_paiement VARCHAR(100),
        description TEXT
      )
    `);

    // Table cotisations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cotisations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        groupe_id UUID REFERENCES groupes(id) ON DELETE CASCADE,
        membre_id UUID REFERENCES users(id) ON DELETE CASCADE,
        montant DECIMAL(10, 2) NOT NULL,
        date_echeance DATE NOT NULL,
        date_paiement TIMESTAMP,
        statut VARCHAR(20) DEFAULT 'en_attente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table votes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        groupe_id UUID REFERENCES groupes(id) ON DELETE CASCADE,
        titre VARCHAR(255) NOT NULL,
        description TEXT,
        date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_fin TIMESTAMP NOT NULL,
        statut VARCHAR(20) DEFAULT 'en_cours',
        created_by UUID REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Table vote_options
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vote_options (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vote_id UUID REFERENCES votes(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        nb_votes INTEGER DEFAULT 0
      )
    `);

    // Table user_votes (pour tracker qui a voté)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vote_id UUID REFERENCES votes(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        option_id UUID REFERENCES vote_options(id) ON DELETE CASCADE,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(vote_id, user_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        provider VARCHAR(30) NOT NULL DEFAULT 'paydunya',
        provider_token VARCHAR(120) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        transaction_id VARCHAR(120),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    if (process.env.NODE_ENV !== 'production' && process.env.DB_LOG_INIT === '1') {
      console.log('✅ Base de données initialisée avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

export default { query, getPool, initDatabase };
