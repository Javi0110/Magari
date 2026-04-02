-- Catálogo del Shop vía RPC: ORDER BY id (índice PK) y statement_timeout más alto
-- dentro de la función (mitiga 57014 cuando PostgREST/REST agota el tiempo antes).

create or replace function public.get_shop_products_catalog(p_limit integer default 200)
returns setof public.shop_products
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.shop_products
  order by id desc
  limit least(coalesce(nullif(p_limit, 0), 200), 500);
$$;

alter function public.get_shop_products_catalog(integer) set statement_timeout = '60s';

grant execute on function public.get_shop_products_catalog(integer) to anon, authenticated;
