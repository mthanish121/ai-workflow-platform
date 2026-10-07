import express from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// GET /api/logs — get all execution logs for user
router.get('/', async (req, res, next) => {
  try {
    const { workflow_id, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT el.*, w.name as workflow_name
      FROM execution_logs el
      JOIN workflows w ON el.workflow_id = w.id
      WHERE el.user_id = $1
    `;
    const values = [req.user.id];
    let paramIdx = 2;

    if (workflow_id) {
      queryText += ` AND el.workflow_id = $${paramIdx++}`;
      values.push(workflow_id);
    }

    queryText += ` ORDER BY el.started_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, values);

    // Count total
    let countText = `SELECT COUNT(*) FROM execution_logs el WHERE el.user_id = $1`;
    const countValues = [req.user.id];
    if (workflow_id) {
      countText += ` AND el.workflow_id = $2`;
      countValues.push(workflow_id);
    }
    const countResult = await query(countText, countValues);

    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/logs/:id — get single log
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT el.*, w.name as workflow_name
       FROM execution_logs el
       JOIN workflows w ON el.workflow_id = w.id
       WHERE el.id = $1 AND el.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json({ log: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
