-- MIGRATION NUMBERING AUDIT WARNING (2026-06-18):
-- This migration has a duplicate numeric prefix in the repository, and
-- drizzle/meta/_journal.json currently tracks only 0000_eager_tempest.
-- Drizzle uses migration filenames as identity/checksum inputs; do not rename
-- this file casually. Manually review ordering and production state before
-- running this migration against production.

-- Phase 9.1: Coin System - Wallet Management Tables
-- Migration for user_wallets, wallet_transactions, wallet_audit_logs, and coin_economy_policies

-- Create user_wallets table
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    current_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_earned INTEGER NOT NULL DEFAULT 0,
    lifetime_spent INTEGER NOT NULL DEFAULT 0,
    wallet_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES user_wallets(id),
    user_id UUID NOT NULL,
    transaction_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create wallet_audit_logs table
CREATE TABLE IF NOT EXISTS wallet_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create coin_economy_policies table
CREATE TABLE IF NOT EXISTS coin_economy_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    coin_reward INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_transaction_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference_type ON wallet_transactions(reference_type);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_logs_target_user_id ON wallet_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_audit_logs_action_type ON wallet_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_coin_economy_policies_event_type ON coin_economy_policies(event_type);
