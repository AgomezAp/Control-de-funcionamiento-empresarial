-- Migración: Agregar estado "Pausada" al enum de peticiones
-- Fecha: 2025-10-15
-- Descripción: Agrega el estado "Pausada" para peticiones con temporizador pausado

-- Modificar el tipo ENUM para incluir 'Pausada'
ALTER TABLE peticiones 
MODIFY COLUMN estado ENUM('Pendiente', 'En Progreso', 'Pausada', 'Resuelta', 'Cancelada') 
NOT NULL DEFAULT 'Pendiente';

-- Nota: Esta migración es segura porque:
-- 1. No elimina valores existentes
-- 2. Solo agrega un nuevo valor al ENUM
-- 3. Las peticiones existentes mantienen sus estados actuales

SELECT 'Migración completada: Estado Pausada agregado exitosamente' AS mensaje;
