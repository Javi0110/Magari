-- When an admin deletes a consultation request, re-open the booked slot.
-- (Terminal status trigger only runs on completed/archived, not on DELETE.)

create or replace function public.consultation_free_slot_on_delete()
returns trigger
language plpgsql
as $$
begin
  update public.availability_slots
  set is_available = true, updated_at = now()
  where id = old.requested_slot_id;
  return old;
end;
$$;

drop trigger if exists trg_consultation_free_slot_delete on public.consultation_requests;
create trigger trg_consultation_free_slot_delete
  after delete on public.consultation_requests
  for each row
  execute function public.consultation_free_slot_on_delete();

comment on function public.consultation_free_slot_on_delete() is
  'Marks the consultation slot available again after the request row is deleted.';
