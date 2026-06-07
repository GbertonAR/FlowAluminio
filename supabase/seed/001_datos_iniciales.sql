-- FlowAluminio — Seed de datos iniciales para desarrollo
-- Sprint 0 · 2026-06-05

-- Empresa demo
insert into empresas (id, nombre) values
  ('00000000-0000-0000-0000-000000000001', 'Marteletti Fundición SA')
on conflict do nothing;

-- Planta demo
insert into plantas (id, empresa_id, nombre) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Planta Principal')
on conflict do nothing;

-- Tipos de chatarra iniciales
insert into tipos_chatarra (empresa_id, nombre) values
  ('00000000-0000-0000-0000-000000000001', 'Prensa'),
  ('00000000-0000-0000-0000-000000000001', 'Offset'),
  ('00000000-0000-0000-0000-000000000001', 'Común'),
  ('00000000-0000-0000-0000-000000000001', 'Perfil'),
  ('00000000-0000-0000-0000-000000000001', 'Nueva'),
  ('00000000-0000-0000-0000-000000000001', 'Viruta'),
  ('00000000-0000-0000-0000-000000000001', 'Otra')
on conflict do nothing;

-- Calidades de chatarra
insert into calidades_chatarra (empresa_id, nombre, orden) values
  ('00000000-0000-0000-0000-000000000001', '1ra Calidad', 1),
  ('00000000-0000-0000-0000-000000000001', '2da Calidad', 2)
on conflict do nothing;

-- Productos iniciales
insert into productos (empresa_id, nombre) values
  ('00000000-0000-0000-0000-000000000001', 'Tocho'),
  ('00000000-0000-0000-0000-000000000001', 'Lingote')
on conflict do nothing;

-- Categorías de gasto
insert into categorias_gasto (empresa_id, nombre) values
  ('00000000-0000-0000-0000-000000000001', 'Combustible'),
  ('00000000-0000-0000-0000-000000000001', 'Insumos'),
  ('00000000-0000-0000-0000-000000000001', 'Mantenimiento'),
  ('00000000-0000-0000-0000-000000000001', 'Limpieza'),
  ('00000000-0000-0000-0000-000000000001', 'Herramientas'),
  ('00000000-0000-0000-0000-000000000001', 'Transporte'),
  ('00000000-0000-0000-0000-000000000001', 'Varios')
on conflict do nothing;

-- Receta objetivo inicial: 30% primera / 70% segunda
insert into recetas_produccion (empresa_id, mix_1ra_pct, mix_2da_pct, vigencia_desde) values
  ('00000000-0000-0000-0000-000000000001', 0.30, 0.70, current_date)
on conflict do nothing;

-- Parámetros del sistema
insert into parametros_sistema (empresa_id, clave, valor) values
  ('00000000-0000-0000-0000-000000000001', 'umbral_merma_alerta_pct', '0.08'),
  ('00000000-0000-0000-0000-000000000001', 'umbral_desvio_stock_pct', '0.02'),
  ('00000000-0000-0000-0000-000000000001', 'dias_sin_movimiento_alerta', '30'),
  ('00000000-0000-0000-0000-000000000001', 'session_timeout_minutos', '30')
on conflict do nothing;
