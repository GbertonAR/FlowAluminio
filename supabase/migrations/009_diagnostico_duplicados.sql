-- ============================================================
-- FlowAluminio — Diagnóstico de duplicados (SOLO LECTURA)
-- 2026-06-18 · Autor: KAI
-- Ejecutar en: Supabase SQL Editor — NO modifica datos
-- empresa_id GMarteletti: 52414f04-e91b-49df-b5d3-f5127cd1905c
-- ============================================================

\set empresa '52414f04-e91b-49df-b5d3-f5127cd1905c'

-- ─── 1. PLANTAS ─────────────────────────────────────────────
SELECT 'plantas' AS tabla, nombre, COUNT(*) AS copias, array_agg(id ORDER BY created_at) AS ids
FROM plantas
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
GROUP BY nombre
HAVING COUNT(*) > 1;

-- ─── 2. CLIENTES ────────────────────────────────────────────
SELECT 'clientes' AS tabla, nombre, COUNT(*) AS copias, array_agg(id ORDER BY created_at) AS ids
FROM clientes
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
GROUP BY nombre
HAVING COUNT(*) > 1;

-- ─── 3. PROVEEDORES ─────────────────────────────────────────
SELECT 'proveedores' AS tabla, nombre, COUNT(*) AS copias, array_agg(id ORDER BY created_at) AS ids
FROM proveedores
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
GROUP BY nombre
HAVING COUNT(*) > 1;

-- ─── 4. EMPLEADOS ───────────────────────────────────────────
SELECT 'empleados' AS tabla, nombre, COUNT(*) AS copias, array_agg(id ORDER BY created_at) AS ids
FROM empleados
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
GROUP BY nombre
HAVING COUNT(*) > 1;

-- ─── 5. TIPOS CHATARRA ──────────────────────────────────────
SELECT 'tipos_chatarra' AS tabla, nombre, COUNT(*) AS copias, array_agg(id ORDER BY id) AS ids
FROM tipos_chatarra
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
GROUP BY nombre
HAVING COUNT(*) > 1;

-- ─── 6. CATEGORÍAS GASTO ────────────────────────────────────
SELECT 'categorias_gasto' AS tabla, nombre, COUNT(*) AS copias, array_agg(id ORDER BY id) AS ids
FROM categorias_gasto
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
GROUP BY nombre
HAVING COUNT(*) > 1;

-- ─── 7. RECEPCIONES ─────────────────────────────────────────
-- Clave natural: fecha + cliente + remito + kg_fisicos
SELECT 'recepciones' AS tabla,
       fecha, cliente_id,
       COALESCE(remito, '(sin remito)') AS remito,
       kg_fisicos,
       COUNT(*) AS copias,
       array_agg(id ORDER BY created_at) AS ids
FROM recepciones
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
  AND estado != 'anulado'
GROUP BY fecha, cliente_id, remito, kg_fisicos
HAVING COUNT(*) > 1
ORDER BY fecha;

-- ─── 8. DESPACHOS ───────────────────────────────────────────
SELECT 'despachos' AS tabla,
       fecha, cliente_id,
       COALESCE(remito, '(sin remito)') AS remito,
       kg_despachados,
       COUNT(*) AS copias,
       array_agg(id ORDER BY created_at) AS ids
FROM despachos
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
  AND estado != 'anulado'
GROUP BY fecha, cliente_id, remito, kg_despachados
HAVING COUNT(*) > 1
ORDER BY fecha;

-- ─── 9. PRODUCCIONES / COLADAS ──────────────────────────────
SELECT 'producciones_coladas' AS tabla,
       fecha, numero_colada, cliente_destino_id, kg_tocho,
       COUNT(*) AS copias,
       array_agg(id ORDER BY created_at) AS ids
FROM producciones_coladas
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
  AND estado != 'anulado'
GROUP BY fecha, numero_colada, cliente_destino_id, kg_tocho
HAVING COUNT(*) > 1
ORDER BY fecha;

-- ─── 10. COBROS ─────────────────────────────────────────────
SELECT 'cobros' AS tabla,
       fecha, cliente_id, importe,
       COUNT(*) AS copias,
       array_agg(id ORDER BY created_at) AS ids
FROM cobros
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
  AND estado != 'anulado'
GROUP BY fecha, cliente_id, importe
HAVING COUNT(*) > 1;

-- ─── 11. GASTOS ─────────────────────────────────────────────
SELECT 'gastos' AS tabla,
       fecha, concepto, importe,
       COUNT(*) AS copias,
       array_agg(id ORDER BY created_at) AS ids
FROM gastos
WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c'
  AND estado != 'anulado'
GROUP BY fecha, concepto, importe
HAVING COUNT(*) > 1;

-- ─── 12. RESUMEN CONTEO TOTAL ───────────────────────────────
-- Cuántos registros hay por tabla (para detectar seed ejecutado N veces)
SELECT
  (SELECT COUNT(*) FROM plantas             WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS plantas,
  (SELECT COUNT(*) FROM clientes            WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS clientes,
  (SELECT COUNT(*) FROM proveedores         WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS proveedores,
  (SELECT COUNT(*) FROM empleados           WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS empleados,
  (SELECT COUNT(*) FROM recepciones         WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS recepciones,
  (SELECT COUNT(*) FROM despachos           WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS despachos,
  (SELECT COUNT(*) FROM producciones_coladas WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS coladas,
  (SELECT COUNT(*) FROM cobros              WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS cobros,
  (SELECT COUNT(*) FROM gastos              WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS gastos,
  (SELECT COUNT(*) FROM pagos               WHERE empresa_id = '52414f04-e91b-49df-b5d3-f5127cd1905c') AS pagos;
