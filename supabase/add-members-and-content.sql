-- Tabla de integrantes
create table if not exists members (
  id         uuid default gen_random_uuid() primary key,
  name       text not null default '',
  role       text default '',
  bio        text default '',
  photo_url  text default '',
  sort_order int default 0,
  published  boolean not null default true,
  created_at timestamptz default now()
);

alter table members enable row level security;

drop policy if exists "anon_read_members"     on members;
drop policy if exists "anon_read_members_pub" on members;
drop policy if exists "auth_all_members"      on members;

create policy "anon_read_members" on members for select to authenticated using (true);
create policy "anon_read_members_pub" on members for select to anon using (published = true);
create policy "auth_all_members"  on members for all to authenticated using (true) with check (true);

-- Contenido editable de la banda
insert into settings (key, value) values ('band_cover_url',       '') on conflict (key) do nothing;
insert into settings (key, value) values ('band_bio',             '') on conflict (key) do nothing;
insert into settings (key, value) values ('band_genres',          'Rock Alternativo,Rock Fusion,Pop Punk,Indie Rock') on conflict (key) do nothing;
insert into settings (key, value) values ('band_location',        'Lima, Perú') on conflict (key) do nothing;

-- Información de booking
insert into settings (key, value) values ('booking_highlights',   '') on conflict (key) do nothing;
insert into settings (key, value) values ('booking_description',  '') on conflict (key) do nothing;
insert into settings (key, value) values ('booking_manager',      '') on conflict (key) do nothing;
insert into settings (key, value) values ('booking_email',        '') on conflict (key) do nothing;
insert into settings (key, value) values ('booking_phone',        '') on conflict (key) do nothing;
insert into settings (key, value) values ('booking_rider',        '') on conflict (key) do nothing;
