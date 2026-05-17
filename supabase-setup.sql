-- Esegui questo SQL nel Supabase Dashboard > SQL Editor
-- Una volta sola, dopo aver creato il progetto.

create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  iscritta_il timestamptz not null default now(),
  attiva      boolean not null default true
);

-- Indice per ricerca rapida
create index if not exists idx_newsletter_email on newsletter_subscribers (email);

-- Blocca lettura pubblica, permetti solo insert con chiave anonima
alter table newsletter_subscribers enable row level security;

create policy "chiunque può iscriversi"
  on newsletter_subscribers
  for insert
  with check (true);

-- Solo service_role può leggere la lista (per invio email)
create policy "solo admin può leggere"
  on newsletter_subscribers
  for select
  using (auth.role() = 'service_role');
