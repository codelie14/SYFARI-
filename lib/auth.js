import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'syfari_secret_key_2025';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    return verifyToken(token);
  } catch (error) {
    return null;
  }
};

export const createUser = async (userData) => {
  const { email, password, nom, prenom, telephone } = userData;
  const passwordHash = await hashPassword(password);
  
  const result = await query(
    `INSERT INTO users (email, password_hash, nom, prenom, telephone) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, email, nom, prenom, telephone, plan, role, created_at`,
    [email, passwordHash, nom, prenom, telephone]
  );
  
  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

export const getUserById = async (id) => {
  const result = await query(
    'SELECT id, email, nom, prenom, telephone, plan, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};
