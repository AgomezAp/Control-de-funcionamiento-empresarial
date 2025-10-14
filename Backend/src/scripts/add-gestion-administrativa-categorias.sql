-- Migración: Agregar "Gestión Administrativa" a las categorías
-- Fecha: 2025-10-14
-- Descripción: Permite que el área de Gestión Administrativa tenga sus propias categorías

-- 1. Modificar el ENUM para incluir "Gestión Administrativa"
ALTER TABLE categorias 
MODIFY COLUMN area_tipo ENUM('Diseño', 'Pautas', 'Gestión Administrativa') NOT NULL;

-- 2. Insertar categorías de ejemplo para Gestión Administrativa
-- (El usuario mencionó que las cambiará después)

INSERT INTO categorias (nombre, area_tipo, costo, es_variable, requiere_descripcion_extra) VALUES
('Trámite Administrativo', 'Gestión Administrativa', 50.00, false, false),
('Gestión Documental', 'Gestión Administrativa', 75.00, false, false),
('Archivo y Organización', 'Gestión Administrativa', 60.00, false, false),
('Proceso de Compras', 'Gestión Administrativa', 100.00, true, true),
('Gestión de Contratos', 'Gestión Administrativa', 150.00, true, true);

-- 3. Verificar los cambios
SELECT * FROM categorias WHERE area_tipo = 'Gestión Administrativa';

-- NOTA: El usuario puede modificar estas categorías desde el panel de administración
-- o ejecutar UPDATE para cambiarlas según sus necesidades.
