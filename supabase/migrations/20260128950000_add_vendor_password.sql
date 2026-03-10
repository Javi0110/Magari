-- Add password column for vendors so they can set their own login password

alter table public.vendors
  add column if not exists password text;

