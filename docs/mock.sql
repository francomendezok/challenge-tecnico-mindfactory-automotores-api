-- Mock de datos argentinos para pruebas locales (Postgres 16)
-- Los CUIT pasan verificación módulo 11 (misma regla que la API).
--
-- Cómo cargar (con Docker):
--   docker compose cp docs/mock.sql db:/tmp/mock.sql
--   docker compose exec db psql -U postgres -d automotores -f /tmp/mock.sql
--
-- Cómo cargar desde tu máquina (cliente psql al puerto publicado, ej. 5433):
--   psql "postgresql://postgres:postgres@localhost:5433/automotores" -f docs/mock.sql
--
-- Nota: diseñado para no duplicar dominios/CUIT si ya existen (NOT EXISTS / filtros).
-- Si necesitás repetir desde cero: vaciar tablas o usar otra base.

BEGIN;

-- 1) Sujetos (personas y empresa)
INSERT INTO "Sujeto" (spo_cuit, spo_denominacion)
VALUES
  ('20123456786', 'Transportes Pampeanos S.A.'),
  ('27302878485', 'María Elena Fernández'),
  ('27222333445', 'Gómez & Asociados SRL')
ON CONFLICT (spo_cuit) DO UPDATE SET spo_denominacion = EXCLUDED.spo_denominacion;

-- 2) Objetos de valor (código = dominio del vehículo)
INSERT INTO "Objeto_De_Valor" (ovp_tipo, ovp_codigo, ovp_descripcion)
VALUES
  ('AUTOMOTOR', 'ABC123', 'VW Gol Trend 5P - CABA'),
  ('AUTOMOTOR', 'AB12CDE', 'Toyota Hilux 4x4 - Zona norte'),
  ('AUTOMOTOR', 'AAF555', 'Fiat Cronos 1.3 - Rosario')
ON CONFLICT (ovp_codigo) DO UPDATE SET ovp_descripcion = EXCLUDED.ovp_descripcion;

-- 3) Automotores (uno por objeto de valor; dominio coincide con ovp_codigo)
INSERT INTO "Automotores" (atr_ovp_id, atr_dominio, atr_numero_chasis, atr_numero_motor, atr_color, atr_fecha_fabricacion)
SELECT o.ovp_id, 'ABC123', '8A1BM123456789012', 'XU9A7654321', 'Blanco', 201805
FROM "Objeto_De_Valor" o
WHERE o.ovp_codigo = 'ABC123'
  AND NOT EXISTS (SELECT 1 FROM "Automotores" x WHERE x.atr_dominio = 'ABC123');

INSERT INTO "Automotores" (atr_ovp_id, atr_dominio, atr_numero_chasis, atr_numero_motor, atr_color, atr_fecha_fabricacion)
SELECT o.ovp_id, 'AB12CDE', '9BR123456789ABCDE1', '2.8TD-998877', 'Gris plata', 202003
FROM "Objeto_De_Valor" o
WHERE o.ovp_codigo = 'AB12CDE'
  AND NOT EXISTS (SELECT 1 FROM "Automotores" x WHERE x.atr_dominio = 'AB12CDE');

INSERT INTO "Automotores" (atr_ovp_id, atr_dominio, atr_numero_chasis, atr_numero_motor, atr_color, atr_fecha_fabricacion)
SELECT o.ovp_id, 'AAF555', '9BWZZZ377VT004321', 'FIRE-445566', 'Azul francia', 201911
FROM "Objeto_De_Valor" o
WHERE o.ovp_codigo = 'AAF555'
  AND NOT EXISTS (SELECT 1 FROM "Automotores" x WHERE x.atr_dominio = 'AAF555');

-- 4) Vínculo dueño activo (responsable S, sin fecha_fin) — regla del índice único parcial
INSERT INTO "Vinculo_Sujeto_Objeto" (vso_ovp_id, vso_spo_id, vso_tipo_vinculo, vso_porcentaje, vso_responsable, vso_fecha_inicio, vso_fecha_fin)
SELECT o.ovp_id, s.spo_id, 'DUENO', 100, 'S', DATE '2022-01-10', NULL
FROM "Objeto_De_Valor" o
JOIN "Sujeto" s ON s.spo_cuit = '20123456786'
WHERE o.ovp_codigo = 'ABC123'
  AND NOT EXISTS (
    SELECT 1 FROM "Vinculo_Sujeto_Objeto" v
    WHERE v.vso_ovp_id = o.ovp_id
      AND v.vso_responsable = 'S'
      AND v.vso_fecha_fin IS NULL
      AND v.vso_tipo_vinculo = 'DUENO'
  );

INSERT INTO "Vinculo_Sujeto_Objeto" (vso_ovp_id, vso_spo_id, vso_tipo_vinculo, vso_porcentaje, vso_responsable, vso_fecha_inicio, vso_fecha_fin)
SELECT o.ovp_id, s.spo_id, 'DUENO', 100, 'S', DATE '2021-08-20', NULL
FROM "Objeto_De_Valor" o
JOIN "Sujeto" s ON s.spo_cuit = '27302878485'
WHERE o.ovp_codigo = 'AB12CDE'
  AND NOT EXISTS (
    SELECT 1 FROM "Vinculo_Sujeto_Objeto" v
    WHERE v.vso_ovp_id = o.ovp_id
      AND v.vso_responsable = 'S'
      AND v.vso_fecha_fin IS NULL
      AND v.vso_tipo_vinculo = 'DUENO'
  );

INSERT INTO "Vinculo_Sujeto_Objeto" (vso_ovp_id, vso_spo_id, vso_tipo_vinculo, vso_porcentaje, vso_responsable, vso_fecha_inicio, vso_fecha_fin)
SELECT o.ovp_id, s.spo_id, 'DUENO', 100, 'S', DATE '2024-03-05', NULL
FROM "Objeto_De_Valor" o
JOIN "Sujeto" s ON s.spo_cuit = '27222333445'
WHERE o.ovp_codigo = 'AAF555'
  AND NOT EXISTS (
    SELECT 1 FROM "Vinculo_Sujeto_Objeto" v
    WHERE v.vso_ovp_id = o.ovp_id
      AND v.vso_responsable = 'S'
      AND v.vso_fecha_fin IS NULL
      AND v.vso_tipo_vinculo = 'DUENO'
  );

COMMIT;

-- Referencia rápida para curls (API en :3000)
-- GET    http://localhost:3000/api/automotores
-- GET    http://localhost:3000/api/automotores/ABC123
-- GET    http://localhost:3000/api/sujetos/by-cuit/20123456786
