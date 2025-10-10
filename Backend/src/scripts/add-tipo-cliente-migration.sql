-- Migración: Agregar campo tipo_cliente a tabla clientes
-- Fecha: 2025-10-10
-- Descripción: Se agrega columna tipo_cliente (ENUM) y se elimina cualquier referencia a área

-- 1. Agregar columna tipo_cliente
ALTER TABLE clientes 
ADD COLUMN tipo_cliente ENUM('Meta Ads', 'Google Ads', 'Externo', 'Otro') 
NOT NULL 
DEFAULT 'Otro'
AFTER pais;

-- 2. Actualizar registros existentes (opcional, si deseas asignar valores específicos)
-- Por defecto todos tendrán 'Otro', pero puedes ajustar según necesites:
UPDATE clientes SET tipo_cliente = 'Otro' WHERE tipo_cliente IS NULL;

-- 3. Verificar los cambios
SELECT id, nombre, pais, tipo_cliente FROM clientes LIMIT 10;
