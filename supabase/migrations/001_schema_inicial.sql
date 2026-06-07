-- ============================================================
-- FlowAluminio — Schema Inicial v1.0
-- Sprint 0 · 2026-06-05
-- Autor: ARKO (generado bajo supervisión de ADA L y CHARLES)
-- ============================================================

-- ─── EXTENSIONES ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TABLAS MAESTRAS ────────────────────────────────────────────────────────

create table if not exists empresas (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists plantas (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid not null references empresas(id),
  nombre      text not null,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists roles_sistema (
  id     text primary key,  -- 'operaciones' | 'comercial' | 'administracion' | 'superadmin'
  label  text not null
);

insert into roles_sistema (id, label) values
  ('operaciones',    'Operaciones'),
  ('comercial',      'Comercial / Dueño'),
  ('administracion', 'Administración'),
  ('superadmin',     'Superadministrador')
on conflict do nothing;

create table if not exists perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  empresa_id  uuid references empresas(id),
  planta_id   uuid references plantas(id),
  rol         text not null references roles_sistema(id),
  nombre      text not null,
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists clientes (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  nombre          text not null,
  tipo            text not null default 'cliente',  -- 'cliente' | 'proveedor_cliente' | 'interno'
  activo          boolean not null default true,
  observaciones   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists proveedores (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  nombre          text not null,
  tipo            text,
  cliente_id      uuid references clientes(id),
  cuit            text,
  telefono        text,
  activo          boolean not null default true,
  observaciones   text,
  created_at      timestamptz not null default now()
);

create table if not exists tipos_chatarra (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid not null references empresas(id),
  nombre      text not null,  -- 'prensa' | 'offset' | 'comun' | 'perfil' | 'nueva' | 'viruta' | 'otra'
  activo      boolean not null default true
);

create table if not exists calidades_chatarra (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid not null references empresas(id),
  nombre      text not null,  -- 'primera' | 'segunda'
  orden       int not null default 1,
  activo      boolean not null default true
);

create table if not exists productos (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid not null references empresas(id),
  nombre      text not null,  -- 'tocho' | 'lingote' | etc.
  activo      boolean not null default true
);

create table if not exists categorias_gasto (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid not null references empresas(id),
  nombre      text not null,
  activo      boolean not null default true
);

create table if not exists medios_pago (
  id     text primary key,
  label  text not null
);

insert into medios_pago (id, label) values
  ('efectivo',      'Efectivo'),
  ('transferencia', 'Transferencia'),
  ('cheque',        'Cheque'),
  ('otro',          'Otro')
on conflict do nothing;

create table if not exists empleados (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid not null references empresas(id),
  nombre      text not null,
  activo      boolean not null default true,
  fecha_alta  date not null default current_date,
  fecha_baja  date,
  created_at  timestamptz not null default now()
);

-- ─── TABLAS CON VIGENCIA ────────────────────────────────────────────────────

create table if not exists mermas_consensuadas (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  cliente_id      uuid not null references clientes(id),
  tipo_chatarra_id uuid references tipos_chatarra(id),
  merma_pct       numeric(5,4) not null check (merma_pct >= 0 and merma_pct < 1),
  vigencia_desde  date not null,
  vigencia_hasta  date,
  activo          boolean not null default true,
  observacion     text,
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now()
);

create table if not exists recetas_produccion (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  mix_1ra_pct     numeric(5,4) not null default 0.30,
  mix_2da_pct     numeric(5,4) not null default 0.70,
  vigencia_desde  date not null,
  vigencia_hasta  date,
  activo          boolean not null default true,
  check (mix_1ra_pct + mix_2da_pct = 1.0)
);

create table if not exists condiciones_pago_empleado (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  empleado_id     uuid not null references empleados(id),
  modalidad       text not null,  -- 'mensual'|'semanal'|'diario'|'por_kilo'|'por_colada'|'mixto'
  valor           numeric(12,2) not null,
  viatico         numeric(12,2) not null default 0,
  premio_presentismo numeric(12,2) not null default 0,
  vigencia_desde  date not null,
  vigencia_hasta  date,
  activo          boolean not null default true
);

create table if not exists precios_comerciales (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  cliente_id      uuid not null references clientes(id),
  tipo_operacion  text not null,  -- 'fason' | 'pleno' | 'mixto'
  precio          numeric(12,2) not null,
  vigencia_desde  date not null,
  vigencia_hasta  date,
  activo          boolean not null default true
);

-- ─── ENTIDADES OPERATIVAS ────────────────────────────────────────────────────

create table if not exists recepciones (
  id                  uuid primary key default uuid_generate_v4(),
  empresa_id          uuid not null references empresas(id),
  planta_id           uuid references plantas(id),
  fecha               date not null,
  cliente_id          uuid not null references clientes(id),
  proveedor_id        uuid references proveedores(id),
  tipo_chatarra_id    uuid references tipos_chatarra(id),
  calidad_id          uuid references calidades_chatarra(id),
  kg_fisicos          numeric(10,2) not null check (kg_fisicos > 0),
  merma_pct           numeric(5,4) not null,
  kg_merma_comercial  numeric(10,2) not null,
  kg_reconocidos      numeric(10,2) not null,
  remito              text,
  estado              text not null default 'confirmado',
  observacion         text,
  created_by          uuid references perfiles(id),
  created_at          timestamptz not null default now()
);

create table if not exists producciones_coladas (
  id                    uuid primary key default uuid_generate_v4(),
  empresa_id            uuid not null references empresas(id),
  planta_id             uuid references plantas(id),
  fecha                 date not null,
  numero_colada         int not null check (numero_colada between 1 and 3),
  cliente_destino_id    uuid not null references clientes(id),
  propietario_1ra_id    uuid references clientes(id),
  propietario_2da_id    uuid references clientes(id),
  kg_1ra                numeric(10,2) not null default 0,
  kg_2da                numeric(10,2) not null default 0,
  kg_tocho              numeric(10,2) not null check (kg_tocho > 0),
  kg_escoria            numeric(10,2) not null default 0,
  kg_remanente_recibido numeric(10,2) not null default 0,
  kg_remanente_dejado   numeric(10,2) not null default 0,
  -- Calculados y almacenados para performance
  kg_chatarra_total     numeric(10,2) not null,
  kg_metal_disponible   numeric(10,2) not null,
  kg_volatilizado       numeric(10,2) not null,
  escoria_pct           numeric(5,4) not null,
  volatilizacion_pct    numeric(5,4) not null,
  rendimiento_pct       numeric(5,4) not null,
  merma_productiva_pct  numeric(5,4) not null,
  mix_1ra_pct           numeric(5,4) not null,
  mix_2da_pct           numeric(5,4) not null,
  producto_id           uuid references productos(id),
  estado                text not null default 'confirmado',
  observaciones         text,
  created_by            uuid references perfiles(id),
  created_at            timestamptz not null default now()
);

create table if not exists conteos_inventario (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  fecha           date not null,
  cliente_id      uuid not null references clientes(id),
  tipo_chatarra_id uuid references tipos_chatarra(id),
  calidad_id      uuid references calidades_chatarra(id),
  kg_real         numeric(10,2) not null,
  kg_teorico      numeric(10,2) not null,
  desvio_kg       numeric(10,2) not null,
  desvio_pct      numeric(6,4) not null,
  observacion     text,
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now()
);

create table if not exists despachos (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  fecha           date not null,
  cliente_id      uuid not null references clientes(id),
  kg_despachados  numeric(10,2) not null check (kg_despachados > 0),
  remito          text,
  producto_id     uuid references productos(id),
  estado          text not null default 'confirmado',
  observacion     text,
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now()
);

create table if not exists valorizaciones_despacho (
  id                  uuid primary key default uuid_generate_v4(),
  empresa_id          uuid not null references empresas(id),
  despacho_id         uuid not null references despachos(id),
  tipo_operacion      text not null,  -- 'fason' | 'pleno' | 'mixto'
  precio              numeric(12,2) not null,
  importe             numeric(14,2) not null,
  condicion_comercial text,
  observacion         text,
  created_by          uuid references perfiles(id),
  created_at          timestamptz not null default now()
);

create table if not exists conciliaciones_cliente (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  cliente_id      uuid not null references clientes(id),
  periodo_desde   date not null,
  periodo_hasta   date not null,
  estado          text not null default 'borrador',
  observacion     text,
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now(),
  cerrada_at      timestamptz,
  cerrada_by      uuid references perfiles(id)
);

create table if not exists caja_chica (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  fecha_apertura  date not null,
  monto_inicial   numeric(12,2) not null,
  total_gastado   numeric(12,2) not null default 0,
  efectivo_devuelto numeric(12,2),
  diferencia      numeric(12,2),
  estado          text not null default 'abierta',
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now(),
  cerrada_at      timestamptz,
  cerrada_by      uuid references perfiles(id)
);

create table if not exists gastos (
  id                  uuid primary key default uuid_generate_v4(),
  empresa_id          uuid not null references empresas(id),
  fecha               date not null,
  categoria_id        uuid references categorias_gasto(id),
  concepto            text not null,
  proveedor_id        uuid references proveedores(id),
  importe             numeric(12,2) not null,
  medio_pago_id       text references medios_pago(id),
  pagado_por          uuid references perfiles(id),
  caja_chica_id       uuid references caja_chica(id),
  estado              text not null default 'pendiente',
  observacion         text,
  created_by          uuid references perfiles(id),
  created_at          timestamptz not null default now()
);

create table if not exists cobros (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  fecha           date not null,
  cliente_id      uuid not null references clientes(id),
  importe         numeric(14,2) not null,
  medio_pago_id   text references medios_pago(id),
  observacion     text,
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now()
);

create table if not exists pagos (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  fecha           date not null,
  cliente_id      uuid references clientes(id),
  proveedor_id    uuid references proveedores(id),
  recepcion_id    uuid references recepciones(id),
  importe         numeric(14,2) not null,
  medio_pago_id   text references medios_pago(id),
  observacion     text,
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now()
);

create table if not exists comprobantes (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  tipo            text not null,
  storage_path    text not null,
  entidad_tipo    text not null,   -- 'recepcion' | 'despacho' | 'gasto' | 'cobro' | etc.
  entidad_id      uuid not null,
  estado          text not null default 'pendiente',
  observacion     text,
  uploaded_by     uuid references perfiles(id),
  created_at      timestamptz not null default now()
);

create table if not exists presentismo (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  fecha           date not null,
  empleado_id     uuid not null references empleados(id),
  estado          text not null,
  horas_extra     numeric(4,2) not null default 0,
  observacion     text,
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now(),
  unique (empresa_id, fecha, empleado_id)
);

create table if not exists liquidaciones (
  id                        uuid primary key default uuid_generate_v4(),
  empresa_id                uuid not null references empresas(id),
  periodo_desde             date not null,
  periodo_hasta             date not null,
  empleado_id               uuid not null references empleados(id),
  modalidad                 text not null,
  valor_aplicado            numeric(12,2) not null,
  dias_habiles              int not null,
  dias_presentes            int not null,
  dias_ausentes             int not null,
  horas_extra               numeric(6,2) not null default 0,
  kg_producidos_dias_presentes numeric(10,2),
  kg_sugeridos_liquidar     numeric(10,2),
  kg_liquidados             numeric(10,2),
  valor_por_kg              numeric(10,4),
  subtotal_por_kg           numeric(12,2),
  motivo_ajuste_kg          text,
  viaticos                  numeric(12,2) not null default 0,
  extras                    numeric(12,2) not null default 0,
  premio_sugerido           boolean not null default false,
  premio_aprobado           boolean,
  monto_premio              numeric(12,2) not null default 0,
  motivo_cambio_premio      text,
  descuentos                numeric(12,2) not null default 0,
  adelantos                 numeric(12,2) not null default 0,
  total_sugerido            numeric(12,2) not null,
  total_pagado              numeric(12,2),
  estado                    text not null default 'borrador',
  created_by                uuid references perfiles(id),
  created_at                timestamptz not null default now()
);

-- ─── AUDITORÍA ──────────────────────────────────────────────────────────────

create table if not exists auditoria_eventos (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid references empresas(id),
  usuario_id      uuid references perfiles(id),
  accion          text not null,
  tabla           text not null,
  registro_id     uuid,
  valor_anterior  jsonb,
  valor_nuevo     jsonb,
  motivo          text,
  created_at      timestamptz not null default now()
);

-- auditoria_eventos es inmutable: solo INSERT, nunca UPDATE/DELETE
create or replace rule no_update_auditoria as on update to auditoria_eventos do instead nothing;
create or replace rule no_delete_auditoria as on delete to auditoria_eventos do instead nothing;

-- ─── PARÁMETROS DEL SISTEMA ──────────────────────────────────────────────────

create table if not exists parametros_sistema (
  id          uuid primary key default uuid_generate_v4(),
  empresa_id  uuid not null references empresas(id),
  clave       text not null,
  valor       text not null,
  updated_at  timestamptz not null default now(),
  unique (empresa_id, clave)
);

-- ─── ÍNDICES ────────────────────────────────────────────────────────────────

create index if not exists idx_recepciones_empresa_fecha        on recepciones(empresa_id, fecha);
create index if not exists idx_recepciones_cliente              on recepciones(cliente_id);
create index if not exists idx_producciones_empresa_fecha       on producciones_coladas(empresa_id, fecha);
create index if not exists idx_despachos_empresa_fecha          on despachos(empresa_id, fecha);
create index if not exists idx_presentismo_empresa_fecha        on presentismo(empresa_id, fecha);
create index if not exists idx_auditoria_empresa_created        on auditoria_eventos(empresa_id, created_at desc);
create index if not exists idx_mermas_cliente_tipo              on mermas_consensuadas(cliente_id, tipo_chatarra_id, vigencia_desde);

-- ─── RLS: habilitar en todas las tablas ─────────────────────────────────────

alter table empresas                 enable row level security;
alter table plantas                  enable row level security;
alter table perfiles                 enable row level security;
alter table clientes                 enable row level security;
alter table proveedores              enable row level security;
alter table tipos_chatarra           enable row level security;
alter table calidades_chatarra       enable row level security;
alter table productos                enable row level security;
alter table categorias_gasto         enable row level security;
alter table empleados                enable row level security;
alter table mermas_consensuadas      enable row level security;
alter table recetas_produccion       enable row level security;
alter table condiciones_pago_empleado enable row level security;
alter table precios_comerciales      enable row level security;
alter table recepciones              enable row level security;
alter table producciones_coladas     enable row level security;
alter table conteos_inventario       enable row level security;
alter table despachos                enable row level security;
alter table valorizaciones_despacho  enable row level security;
alter table conciliaciones_cliente   enable row level security;
alter table caja_chica               enable row level security;
alter table gastos                   enable row level security;
alter table cobros                   enable row level security;
alter table pagos                    enable row level security;
alter table comprobantes             enable row level security;
alter table presentismo              enable row level security;
alter table liquidaciones            enable row level security;
alter table auditoria_eventos        enable row level security;
alter table parametros_sistema       enable row level security;

-- ─── RLS POLICIES — Aislamiento por empresa_id ──────────────────────────────
-- Patrón: cada usuario solo ve datos de su propia empresa

create or replace function get_user_empresa_id()
returns uuid language sql security definer stable as $$
  select empresa_id from perfiles where id = auth.uid()
$$;

create or replace function get_user_rol()
returns text language sql security definer stable as $$
  select rol from perfiles where id = auth.uid()
$$;

-- Política base para tablas con empresa_id
-- Se aplica el mismo patrón a todas las tablas operativas:
-- solo leer/escribir registros donde empresa_id = la empresa del usuario

create policy "usuarios_ven_su_empresa" on perfiles
  for select using (empresa_id = get_user_empresa_id());

create policy "usuarios_ven_clientes_empresa" on clientes
  for all using (empresa_id = get_user_empresa_id());

create policy "usuarios_ven_recepciones_empresa" on recepciones
  for all using (empresa_id = get_user_empresa_id());

create policy "usuarios_ven_producciones_empresa" on producciones_coladas
  for all using (empresa_id = get_user_empresa_id());

create policy "usuarios_ven_despachos_empresa" on despachos
  for all using (empresa_id = get_user_empresa_id());

create policy "usuarios_ven_auditoria_empresa" on auditoria_eventos
  for select using (empresa_id = get_user_empresa_id());

-- Política restrictiva: valorizaciones solo para comercial y superadmin
create policy "solo_comercial_ve_valorizaciones" on valorizaciones_despacho
  for select using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin', 'administracion')
  );

create policy "solo_comercial_escribe_valorizaciones" on valorizaciones_despacho
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );

-- Política restrictiva: liquidaciones solo para comercial y superadmin
create policy "solo_comercial_ve_liquidaciones" on liquidaciones
  for select using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );
