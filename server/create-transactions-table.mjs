import { query } from './src/db/pool.js';
import dotenv from 'dotenv';

dotenv.config();

const createTransactionsTable = async () => {
  console.log('🔄 Creating / verifying transactions table in Supabase PostgreSQL...');

  try {
    // Create transactions table
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
    console.log('✅ Transactions table created/verified successfully');

    // Create indexes for efficient history lookups
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);`);
    console.log('✅ Transactions indexes created/verified');

    console.log('🎉 Migration finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create transactions table:', err.message);
    process.exit(1);
  }
};

createTransactionsTable();
