import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const { email, password, full_name } = data;

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name, plan, created_at`,
      [email.toLowerCase(), password_hash, full_name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, plan: user.plan || 'free' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
    }
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { email, password } = data;

    const result = await query(
      'SELECT id, email, full_name, plan, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, plan: user.plan || 'free' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      'SELECT id, email, full_name, plan, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
