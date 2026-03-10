-- Add status to service_requests and ensure delete is allowed
-- Run in Supabase: SQL Editor → New query → Paste → Run

alter table public.service_requests
  add column if not exists status text not null default 'new';

comment on column public.service_requests.status is 'new | in_progress | completed | cancelled';

-- Optional: index for filtering by status
create index if not exists idx_service_requests_status on public.service_requests (status);
