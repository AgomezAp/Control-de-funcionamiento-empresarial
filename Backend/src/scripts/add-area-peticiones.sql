-- Agregar campo area a la tabla peticiones
-- Este script agrega el campo "area" que diferencia entre Pautas y Diseño

-- 1. Agregar columna area (permitir NULL temporalmente)
ALTER TABLE peticiones 
ADD COLUMN IF NOT EXISTS area VARCHAR(10);

-- 2. Actualizar registros existentes: asignar "Diseño" por defecto
UPDATE peticiones 
SET area = 'Diseño' 
WHERE area IS NULL;

-- 3. Hacer la columna NOT NULL ahora que todos los registros tienen valor
ALTER TABLE peticiones 
ALTER COLUMN area SET NOT NULL;

-- 4. Agregar constraint para validar solo valores permitidos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'peticiones_area_check'
    ) THEN
        ALTER TABLE peticiones 
        ADD CONSTRAINT peticiones_area_check 
        CHECK (area IN ('Pautas', 'Diseño'));
    END IF;
END $$;

-- Verificación
SELECT 'Campo area agregado exitosamente' AS resultado;
SELECT DISTINCT area, COUNT(*) as cantidad 
FROM peticiones 
GROUP BY area;
