-- ═══════════════════════════════════════════════════════
-- SCHEMA COMPLETO — pega todo esto en el SQL Editor
-- de Supabase y pulsa Run
-- ═══════════════════════════════════════════════════════

-- ── Tablas ──────────────────────────────────────────────

create table if not exists posts (
  id         uuid default gen_random_uuid() primary key,
  title      text not null default '',
  content    text not null default '',
  image_url  text default '',
  date       date not null default current_date,
  published  boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists videos (
  id          uuid default gen_random_uuid() primary key,
  title       text not null default '',
  description text default '',
  url         text not null default '',
  date        date not null default current_date,
  published   boolean not null default true,
  created_at  timestamptz default now()
);

create table if not exists shows (
  id         uuid default gen_random_uuid() primary key,
  title      text not null default '',
  venue      text default '',
  address    text default '',
  city       text default 'Lima, Perú',
  date       date not null default current_date,
  time       text default '',
  published  boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists instagram_posts (
  id         uuid default gen_random_uuid() primary key,
  url        text not null default '',
  caption    text default '',
  sort_order int default 0,
  published  boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists tracks (
  id         uuid default gen_random_uuid() primary key,
  title      text not null default '',
  description text default '',
  audio_url  text not null default '',
  cover_url  text default '',
  date       date not null default current_date,
  published  boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists settings (
  key   text primary key,
  value text not null default ''
);

insert into settings (key, value) values ('spotify_url', '') on conflict (key) do nothing;

-- ── Seguridad RLS ────────────────────────────────────────

alter table posts            enable row level security;
alter table videos           enable row level security;
alter table shows            enable row level security;
alter table instagram_posts  enable row level security;
alter table tracks           enable row level security;
alter table settings         enable row level security;

-- Público: solo lee contenido publicado
drop policy if exists "anon_read_posts"    on posts;
drop policy if exists "anon_read_videos"   on videos;
drop policy if exists "anon_read_shows"    on shows;
drop policy if exists "anon_read_ig"       on instagram_posts;
drop policy if exists "anon_read_tracks"   on tracks;
drop policy if exists "anon_read_settings" on settings;

create policy "anon_read_posts"    on posts              for select to anon using (published = true);
create policy "anon_read_videos"   on videos             for select to anon using (published = true);
create policy "anon_read_shows"    on shows              for select to anon using (published = true);
create policy "anon_read_ig"       on instagram_posts    for select to anon using (published = true);
create policy "anon_read_tracks"   on tracks             for select to anon using (published = true);
create policy "anon_read_settings" on settings           for select to anon using (true);

-- Admin autenticado: acceso total
drop policy if exists "auth_all_posts"    on posts;
drop policy if exists "auth_all_videos"   on videos;
drop policy if exists "auth_all_shows"    on shows;
drop policy if exists "auth_all_ig"       on instagram_posts;
drop policy if exists "auth_all_tracks"   on tracks;
drop policy if exists "auth_all_settings" on settings;

create policy "auth_all_posts"    on posts           for all to authenticated using (true) with check (true);
create policy "auth_all_videos"   on videos          for all to authenticated using (true) with check (true);
create policy "auth_all_shows"    on shows           for all to authenticated using (true) with check (true);
create policy "auth_all_ig"       on instagram_posts for all to authenticated using (true) with check (true);
create policy "auth_all_tracks"   on tracks          for all to authenticated using (true) with check (true);
create policy "auth_all_settings" on settings        for all to authenticated using (true) with check (true);

-- ── Storage: buckets a crear manualmente ────────────────
-- Storage > New bucket > "uploads"  (Public) ← imágenes de posts
-- Storage > New bucket > "music"    (Public) ← archivos MP3
