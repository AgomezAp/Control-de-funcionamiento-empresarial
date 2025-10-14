-- Migración: Cambiar de tiempo límite a temporizador por tarea
-- Fecha: 2025-10-14
-- Descripción: Reemplaza el sistema de tiempo límite por un temporizador activo
--              que registra el tiempo empleado en cada petición con capacidad de pausar/reanudar

-- Paso 1: Eliminar columnas antiguas relacionadas con tiempo límite
ALTER TABLE peticiones 
DROP COLUMN tiempo_limite_horas,
DROP COLUMN fecha_limite;

-- Paso 2: Agregar nuevas columnas para el sistema de temporizador
ALTER TABLE peticiones
ADD COLUMN tiempo_empleado_segundos INT NOT NULL DEFAULT 0 
  COMMENT 'Tiempo total empleado en la tarea en segundos',
ADD COLUMN temporizador_activo BOOLEAN NOT NULL DEFAULT FALSE 
  COMMENT 'Indica si el temporizador está corriendo actualmente',
ADD COLUMN fecha_inicio_temporizador DATETIME NULL 
  COMMENT 'Última vez que se inició o reanudó el temporizador',
ADD COLUMN fecha_pausa_temporizador DATETIME NULL 
  COMMENT 'Última vez que se pausó el temporizador';

-- Paso 3: Actualizar peticiones existentes "En Progreso" para iniciar su temporizador
UPDATE peticiones 
SET 
  temporizador_activo = TRUE,
  fecha_inicio_temporizador = fecha_aceptacion
WHERE estado = 'En Progreso' 
  AND fecha_aceptacion IS NOT NULL;

-- Verificación: Consultar peticiones con temporizador activo
-- SELECT id, estado, temporizador_activo, tiempo_empleado_segundos, fecha_inicio_temporizador
-- FROM peticiones 
-- WHERE estado = 'En Progreso';
