import { query } from './src/db/pool.js';
import dotenv from 'dotenv';
dotenv.config();

const addPlanColumns = async () => {
  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) NOT NULL DEFAULT 'free'`);
    console.log('✅ plan column added');
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP WITH TIME ZONE`);
    console.log('✅ plan_updated_at column added');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

addPlanColumns();
