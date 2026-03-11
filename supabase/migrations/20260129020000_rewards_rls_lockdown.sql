-- MAGARI REWARDS – RLS LOCKDOWN
-- Ejecuta este script en Supabase: SQL Editor → New query → Pegar → Run

-- Remove public insert/update policies so only the service role (Netlify functions)
-- can write to rewards tables. The anon key will remain read-only.

drop policy if exists "Allow public insert rewards_users" on public.rewards_users;
drop policy if exists "Allow public update rewards_users" on public.rewards_users;

drop policy if exists "Allow public insert rewards_point_ledger" on public.rewards_point_ledger;

drop policy if exists "Allow public insert rewards_referrals" on public.rewards_referrals;

drop policy if exists "Allow public insert rewards_coupons" on public.rewards_coupons;
drop policy if exists "Allow public update rewards_coupons" on public.rewards_coupons;

