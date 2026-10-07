import express from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Helper to normalize app slugs
const toSlug = (name = '') => name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

// GET /api/connections — List all user's active connections
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, app_id, app_name, account_name, auth_type, status, created_at, updated_at
       FROM user_connections
       WHERE user_id = $1 AND status = 'connected'
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ connections: result.rows });
  } catch (error) {
    next(error);
  }
});

// POST /api/connections — Connect / Authenticate an app account
router.post('/', async (req, res, next) => {
  try {
    const { appId, appName, accountName, authType, credentials } = req.body;
    if (!appName) {
      return res.status(400).json({ message: 'App name is required' });
    }

    const safeAppId = appId || toSlug(appName);
    const safeAccountName = accountName || `${appName} Account (${req.user.email})`;
    const safeAuthType = authType || 'oauth';

    // Upsert into user_connections
    const existing = await query(
      `SELECT id FROM user_connections WHERE user_id = $1 AND (app_id = $2 OR LOWER(app_name) = LOWER($3))`,
      [req.user.id, safeAppId, appName]
    );

    let connection;
    if (existing.rows.length > 0) {
      const updateResult = await query(
        `UPDATE user_connections
         SET account_name = $1, status = 'connected', updated_at = NOW(), credentials = $2
         WHERE id = $3
         RETURNING *`,
        [safeAccountName, JSON.stringify(credentials || {}), existing.rows[0].id]
      );
      connection = updateResult.rows[0];
    } else {
      const insertResult = await query(
        `INSERT INTO user_connections (user_id, app_id, app_name, account_name, auth_type, status, credentials)
         VALUES ($1, $2, $3, $4, $5, 'connected', $6)
         RETURNING *`,
        [req.user.id, safeAppId, appName, safeAccountName, safeAuthType, JSON.stringify(credentials || {})]
      );
      connection = insertResult.rows[0];
    }

    // Also mirror to app_connections for backwards compatibility
    await query(
      `INSERT INTO app_connections (user_id, app_id, app_name, account_name, auth_type, status, credentials)
       VALUES ($1, $2, $3, $4, $5, 'connected', $6)
       ON CONFLICT DO NOTHING`,
      [req.user.id, safeAppId, appName, safeAccountName, safeAuthType, JSON.stringify(credentials || {})]
    ).catch(() => {});

    res.json({
      connection,
      message: `Successfully connected ${appName}!`,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/connections/:id — Disconnect an app
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query(
      `DELETE FROM user_connections WHERE id = $1 AND user_id = $2 RETURNING id, app_name`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    await query(
      `DELETE FROM app_connections WHERE user_id = $1 AND LOWER(app_name) = LOWER($2)`,
      [req.user.id, result.rows[0].app_name]
    ).catch(() => {});

    res.json({ message: `Disconnected ${result.rows[0].app_name}` });
  } catch (error) {
    next(error);
  }
});

export default router;
