-- Save na nuvem (GDD, seção 5): um save por jogador, só o dono lê e grava.
create table public.saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  versao integer not null,
  salvo_em bigint not null,
  dados text not null,
  atualizado_em timestamptz not null default now()
);

alter table public.saves enable row level security;

create policy "dono lê o próprio save" on public.saves
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "dono cria o próprio save" on public.saves
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "dono atualiza o próprio save" on public.saves
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
