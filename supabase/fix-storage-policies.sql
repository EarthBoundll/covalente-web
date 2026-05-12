-- Políticas de Storage para los buckets "uploads" y "music"
-- Ejecuta esto en el SQL Editor de Supabase

-- ── Bucket: uploads (imágenes) ───────────────────────────

drop policy if exists "public_read_uploads"  on storage.objects;
drop policy if exists "auth_insert_uploads"  on storage.objects;
drop policy if exists "auth_update_uploads"  on storage.objects;
drop policy if exists "auth_delete_uploads"  on storage.objects;

create policy "public_read_uploads"
  on storage.objects for select to anon
  using (bucket_id = 'uploads');

create policy "auth_insert_uploads"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads');

create policy "auth_update_uploads"
  on storage.objects for update to authenticated
  using (bucket_id = 'uploads');

create policy "auth_delete_uploads"
  on storage.objects for delete to authenticated
  using (bucket_id = 'uploads');

-- ── Bucket: music (MP3s) ─────────────────────────────────

drop policy if exists "public_read_music"  on storage.objects;
drop policy if exists "auth_insert_music"  on storage.objects;
drop policy if exists "auth_update_music"  on storage.objects;
drop policy if exists "auth_delete_music"  on storage.objects;

create policy "public_read_music"
  on storage.objects for select to anon
  using (bucket_id = 'music');

create policy "auth_insert_music"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'music');

create policy "auth_update_music"
  on storage.objects for update to authenticated
  using (bucket_id = 'music');

create policy "auth_delete_music"
  on storage.objects for delete to authenticated
  using (bucket_id = 'music');
