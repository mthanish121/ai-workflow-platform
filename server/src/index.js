import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import workflowRoutes from './routes/workflows.js';
import logsRoutes from './routes/logs.js';
import aiRoutes from './routes/ai.js';
import billingRoutes from './routes/billing.js';
import mcpRoutes from './routes/mcp.js';
import connectionsRoutes from './routes/connections.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile)
    if (!origin) return callback(null, true);
    // Allow any localhost port (5173, 5174, 3000, etc.) in development
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
    const isVercel = /\.vercel\.app$/.test(origin);
    const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
    if (isLocalhost || isVercel || origin === allowedOrigin) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/mcp', mcpRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
