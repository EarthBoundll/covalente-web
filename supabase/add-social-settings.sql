-- Añade las claves de redes sociales a la tabla settings
-- Ejecuta esto una vez en el SQL Editor de Supabase

insert into settings (key, value) values ('youtube_url',  '') on conflict (key) do nothing;
insert into settings (key, value) values ('tiktok_url',   '') on conflict (key) do nothing;
insert into settings (key, value) values ('facebook_url', '') on conflict (key) do nothing;
insert into settings (key, value) values ('threads_url',  '') on conflict (key) do nothing;
