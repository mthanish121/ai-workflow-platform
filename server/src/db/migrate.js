import { query } from './pool.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  console.log('🔄 Running database migrations...');

  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        plan VARCHAR(50) NOT NULL DEFAULT 'free',
        plan_updated_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    // Ensure columns exist on existing databases
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) NOT NULL DEFAULT 'free';`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP WITH TIME ZONE;`);
    console.log('✅ Users table created/verified (with plan columns)');

    // Workflows table
    await query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger JSONB NOT NULL DEFAULT '{}',
        conditions JSONB NOT NULL DEFAULT '[]',
        actions JSONB NOT NULL DEFAULT '[]',
        status VARCHAR(50) NOT NULL DEFAULT 'inactive',
        is_active BOOLEAN NOT NULL DEFAULT false,
        run_count INTEGER NOT NULL DEFAULT 0,
        last_run_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Workflows table created/verified');

    // Execution logs table
    await query(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'running',
        trigger_data JSONB DEFAULT '{}',
        steps_executed JSONB DEFAULT '[]',
        error_message TEXT,
        duration_ms INTEGER,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log('✅ Execution logs table created/verified');

    // Transactions table (Billing / Subscriptions)
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        payment_id VARCHAR(255) NOT NULL,
        plan VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly',
        status VARCHAR(50) NOT NULL DEFAULT 'succeeded',
        card_last4 VARCHAR(10),
        card_brand VARCHAR(50),
        receipt_note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Transactions table created/verified');

    // MCP Connections table (Model Context Protocol & AI Agents)
    await query(`
      CREATE TABLE IF NOT EXISTS mcp_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        agent_name VARCHAR(255) NOT NULL,
        agent_type VARCHAR(100) NOT NULL,
        endpoint_url TEXT NOT NULL,
        api_token VARCHAR(255) NOT NULL,
        tools JSONB DEFAULT '[]',
        status VARCHAR(50) NOT NULL DEFAULT 'connected',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ MCP connections table created/verified');

    // App Connections & User Connections tables (OAuth & API Keys for Zapier-style Integrations)
    await query(`
      CREATE TABLE IF NOT EXISTS app_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        app_id VARCHAR(100) NOT NULL,
        app_name VARCHAR(255) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        auth_type VARCHAR(50) DEFAULT 'oauth',
        status VARCHAR(50) NOT NULL DEFAULT 'connected',
        credentials JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        app_id VARCHAR(100) NOT NULL,
        app_name VARCHAR(255) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        auth_type VARCHAR(50) DEFAULT 'oauth',
        status VARCHAR(50) NOT NULL DEFAULT 'connected',
        credentials JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Individual workflow step nodes table
    await query(`
      CREATE TABLE IF NOT EXISTS workflow_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'action',
        app_name VARCHAR(255) NOT NULL,
        app_id VARCHAR(100) NOT NULL,
        action_event VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        status VARCHAR(50) DEFAULT 'needs_auth',
        auth_required BOOLEAN DEFAULT true,
        badge_text VARCHAR(100),
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`ALTER TABLE workflows ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]';`);
    await query(`ALTER TABLE workflows ADD COLUMN IF NOT EXISTS template_id VARCHAR(100);`);
    await query(`ALTER TABLE workflows ADD COLUMN IF NOT EXISTS copilot_guidance JSONB DEFAULT '{}';`);
    console.log('✅ App connections, user connections, and workflow steps tables created/verified');

    // Indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_logs_workflow_id ON execution_logs(workflow_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_logs_user_id ON execution_logs(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_logs_started_at ON execution_logs(started_at DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_mcp_user_id ON mcp_connections(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_mcp_created_at ON mcp_connections(created_at DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_app_connections_user_id ON app_connections(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_app_connections_app_id ON app_connections(app_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_workflow_steps_user_id ON workflow_steps(user_id);`);

    console.log('✅ Indexes created/verified');
    console.log('🎉 Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
