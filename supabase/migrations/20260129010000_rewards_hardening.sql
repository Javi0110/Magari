-- MAGARI REWARDS – HARDENING
-- Ejecuta este script en Supabase: SQL Editor → New query → Pegar → Run

-- Ensure each friend email only yields one referral record
alter table public.rewards_referrals
  add constraint if not exists rewards_referrals_friend_email_key unique (friend_email);

-- Optional: ensure we don't insert duplicate purchase ledger entries
-- (Using the "note" field to store the Stripe session id)
create unique index if not exists rewards_point_ledger_unique_purchase
  on public.rewards_point_ledger (user_id, type, note)
  where type = 'purchase';

