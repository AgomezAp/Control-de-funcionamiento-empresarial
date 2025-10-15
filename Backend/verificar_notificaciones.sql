-- ============================================
-- Script de Verificación y Creación
-- Tabla: notificaciones
-- ============================================

-- 1. Verificar si la tabla existe
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'factura_db' 
AND TABLE_NAME = 'notificaciones';

-- Si la consulta anterior NO retorna resultados, ejecutar lo siguiente:

-- 2. Crear tabla notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('asignacion', 'cambio_estado', 'comentario', 'mencion', 'sistema') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    peticion_id INT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura DATETIME NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_notificacion_usuario 
        FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(uid) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_notificacion_peticion 
        FOREIGN KEY (peticion_id) 
        REFERENCES peticiones(id) 
        ON DELETE CASCADE,
    
    -- Índices para mejorar performance
    INDEX idx_usuario_leida (usuario_id, leida),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Verificar estructura de la tabla
DESCRIBE notificaciones;

-- 4. Ver notificaciones existentes (si hay)
SELECT 
    n.id,
    u.nombre_completo AS usuario,
    n.tipo,
    n.titulo,
    n.mensaje,
    n.leida,
    n.fecha_creacion,
    p.titulo AS peticion
FROM notificaciones n
LEFT JOIN usuarios u ON n.usuario_id = u.uid
LEFT JOIN peticiones p ON n.peticion_id = p.id
ORDER BY n.fecha_creacion DESC
LIMIT 10;

-- 5. Contar notificaciones por usuario
SELECT 
    u.nombre_completo,
    COUNT(*) as total_notificaciones,
    SUM(CASE WHEN n.leida = 0 THEN 1 ELSE 0 END) as no_leidas
FROM notificaciones n
JOIN usuarios u ON n.usuario_id = u.uid
GROUP BY u.uid, u.nombre_completo
ORDER BY no_leidas DESC;

-- 6. OPCIONAL: Crear notificación de prueba
-- Reemplaza los IDs según tu base de datos
/*
INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, peticion_id, leida)
VALUES (
    2, -- ID del usuario (ej: pautador)
    'asignacion',
    'Notificación de Prueba',
    'Esta es una notificación de prueba para verificar el sistema',
    NULL, -- O ID de una petición existente
    FALSE
);
*/

-- 7. Ver índices de la tabla
SHOW INDEX FROM notificaciones;

-- 8. Ver tamaño de la tabla
SELECT 
    table_name AS 'Tabla',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamaño (MB)',
    table_rows AS 'Filas'
FROM information_schema.TABLES
WHERE table_schema = 'factura_db' 
AND table_name = 'notificaciones';

-- ============================================
-- Queries Útiles para Debugging
-- ============================================

-- Ver notificaciones no leídas de un usuario específico (cambiar el ID)
SELECT * FROM notificaciones 
WHERE usuario_id = 2 AND leida = FALSE 
ORDER BY fecha_creacion DESC;

-- Marcar todas las notificaciones de un usuario como leídas
-- UPDATE notificaciones SET leida = TRUE WHERE usuario_id = 2;

-- Eliminar notificaciones antiguas (más de 30 días)
-- DELETE FROM notificaciones WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Ver notificaciones por tipo
SELECT 
    tipo,
    COUNT(*) as cantidad
FROM notificaciones
GROUP BY tipo
ORDER BY cantidad DESC;

-- Ver notificaciones de hoy
SELECT * FROM notificaciones 
WHERE DATE(fecha_creacion) = CURDATE()
ORDER BY fecha_creacion DESC;
