-- Add email and rewards tracking to product_reviews so we can award 20 pts when approved
alter table public.product_reviews
  add column if not exists email text,
  add column if not exists status text not null default 'pending',
  add column if not exists rewards_awarded_at timestamptz;

comment on column public.product_reviews.email is 'Customer email for Magari Rewards; 20 pts awarded when review is approved.';
comment on column public.product_reviews.status is 'pending | approved | rejected';
comment on column public.product_reviews.rewards_awarded_at is 'When 20 pts were awarded for this review (once).';

-- Allow updates so Admin can set status to approved/rejected
drop policy if exists "Allow public update product_reviews" on public.product_reviews;
create policy "Allow public update product_reviews"
  on public.product_reviews for update
  using (true)
  with check (true);
