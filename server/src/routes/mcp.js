import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../db/pool.js';
import { z } from 'zod';
import crypto from 'crypto';

const router = express.Router();
router.use(authenticate);

const connectMcpSchema = z.object({
  agent_name: z.string().min(2, 'Agent name is required'),
  agent_type: z.string().default('claude'),
  custom_endpoint: z.string().url().optional().or(z.literal('')),
  tools: z.array(z.string()).optional().default(['workflows_list', 'workflows_trigger', 'data_lookup', 'copilot_generate']),
});

// GET /api/mcp/servers — fetch all connected MCP servers for user
router.get('/servers', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, agent_name, agent_type, endpoint_url, 
              CONCAT(SUBSTRING(api_token, 1, 12), '••••••••', SUBSTRING(api_token, LENGTH(api_token)-3, 4)) AS masked_token,
              tools, status, created_at, updated_at
       FROM mcp_connections
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ servers: result.rows });
  } catch (error) {
    next(error);
  }
});

// POST /api/mcp/connect — create a new MCP server connection
router.post('/connect', async (req, res, next) => {
  try {
    const data = connectMcpSchema.parse(req.body);
    const { agent_name, agent_type, custom_endpoint, tools } = data;

    // Generate secure unique endpoint URL and secret connection bearer token
    const serverId = `srv_${crypto.randomBytes(6).toString('hex')}`;
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const serverEndpoint = custom_endpoint || `https://mcp.flowai.io/api/v1/servers/${serverId}/sse`;
    const apiToken = `mcp_live_${crypto.randomBytes(24).toString('hex')}`;

    const result = await query(
      `INSERT INTO mcp_connections (
        user_id, agent_name, agent_type, endpoint_url, api_token, tools, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, agent_name, agent_type, endpoint_url, api_token, tools, status, created_at`,
      [
        req.user.id,
        agent_name,
        agent_type,
        serverEndpoint,
        apiToken,
        JSON.stringify(tools),
        'connected',
      ]
    );

    const created = result.rows[0];
    console.log(`[FlowAI MCP] User ${req.user.id} connected MCP Agent: ${agent_name} (${agent_type})`);

    res.status(201).json({
      message: `MCP Server connected for ${agent_name}!`,
      server: {
        ...created,
        masked_token: `${apiToken.slice(0, 12)}••••••••${apiToken.slice(-4)}`,
        raw_token: apiToken, // Returned once upon creation for copy-paste
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    next(error);
  }
});

// DELETE /api/mcp/servers/:id — disconnect MCP server
router.delete('/servers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM mcp_connections WHERE id = $1 AND user_id = $2 RETURNING id, agent_name',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'MCP server connection not found' });
    }

    res.json({
      message: `MCP Server "${result.rows[0].agent_name}" disconnected successfully.`,
      id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
