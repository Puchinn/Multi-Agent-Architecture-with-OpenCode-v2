-- Migración: create_inventario_items
-- Circo Gran Fantasía — inventario técnico en Supabase Postgres
-- Fecha: 2026-10-08

create table public.inventario_items (
  id bigint generated always as identity primary key,
  codigo text not null unique,
  nombre text not null,
  categoria text not null,
  cantidad integer not null default 0,
  peso_kg numeric(6,2) not null default 0,
  estado text not null default 'operativo',
  ubicacion text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventario_items_codigo_formato_check check (codigo ~ '^UTL-[0-9]{3}$'),
  constraint inventario_items_categoria_check check (categoria in ('acrobacia','utilería','disfraz','sonido','iluminación','carpa','seguridad','otro')),
  constraint inventario_items_estado_check check (estado in ('operativo','en_reparacion','dado_de_baja')),
  constraint inventario_items_cantidad_check check (cantidad >= 0),
  constraint inventario_items_peso_check check (peso_kg >= 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger inventario_items_set_updated_at
before update on public.inventario_items
for each row
execute function public.set_updated_at();

create index inventario_items_estado_idx on public.inventario_items (estado);

-- RLS activado SIN políticas públicas: sólo el rol del servidor escribe/lee.
alter table public.inventario_items enable row level security;
