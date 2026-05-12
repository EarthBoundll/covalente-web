-- Ejecuta esto si ves "new row violates row-level security policy"
-- Borra y recrea todas las políticas desde cero

drop policy if exists "anon_read_posts"    on posts;
drop policy if exists "anon_read_videos"   on videos;
drop policy if exists "anon_read_shows"    on shows;
drop policy if exists "anon_read_ig"       on instagram_posts;
drop policy if exists "anon_read_tracks"   on tracks;
drop policy if exists "anon_read_settings" on settings;

drop policy if exists "auth_all_posts"    on posts;
drop policy if exists "auth_all_videos"   on videos;
drop policy if exists "auth_all_shows"    on shows;
drop policy if exists "auth_all_ig"       on instagram_posts;
drop policy if exists "auth_all_tracks"   on tracks;
drop policy if exists "auth_all_settings" on settings;

-- Lectura pública (solo contenido publicado)
create policy "anon_read_posts"    on posts           for select to anon using (published = true);
create policy "anon_read_videos"   on videos          for select to anon using (published = true);
create policy "anon_read_shows"    on shows           for select to anon using (published = true);
create policy "anon_read_ig"       on instagram_posts for select to anon using (published = true);
create policy "anon_read_tracks"   on tracks          for select to anon using (published = true);
create policy "anon_read_settings" on settings        for select to anon using (true);

-- Admin autenticado: acceso total (select + insert + update + delete)
create policy "auth_all_posts"    on posts           for all to authenticated using (true) with check (true);
create policy "auth_all_videos"   on videos          for all to authenticated using (true) with check (true);
create policy "auth_all_shows"    on shows           for all to authenticated using (true) with check (true);
create policy "auth_all_ig"       on instagram_posts for all to authenticated using (true) with check (true);
create policy "auth_all_tracks"   on tracks          for all to authenticated using (true) with check (true);
create policy "auth_all_settings" on settings        for all to authenticated using (true) with check (true);
