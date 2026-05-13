-- Añade columna flyer_url a la tabla shows
-- Ejecuta esto en el SQL Editor de Supabase

alter table shows add column if not exists flyer_url text default '';
