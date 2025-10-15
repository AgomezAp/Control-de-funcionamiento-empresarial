# 🚀 Guía Rápida de Inicio - Sistema de Notificaciones

## ✅ Estado Actual

**Backend:**
- ✅ Modelo `Notificacion` creado
- ✅ Servicio `notificacion.service.ts` implementado
- ✅ Routes `/api/notificaciones` configuradas
- ✅ WebSocket configurado para emitir notificaciones
- ✅ Integración con creación y aceptación de peticiones

**Frontend:**
- ✅ Modelo `notificacion.model.ts` actualizado
- ✅ Servicio API `notificacion-api.service.ts` creado
- ✅ Servicio `notificacion.service.ts` reescrito con integración WebSocket
- ✅ Servicio `websocket.service.ts` actualizado con listeners
- ✅ Componente `NotificationCenterComponent` compatible
- ✅ Sin errores de compilación

---

## 🎯 Próximos Pasos para Probar

### Paso 1: Iniciar Backend

```bash
cd Backend
npm run dev
```

**Verificar en console:**
```
✅ Servidor corriendo en puerto 3000
✅ BD conectada
✅ Sequelize sincronizando modelos...
```

**Si la tabla no existe**, Sequelize la creará automáticamente si tienes `alter: true` o `sync: true` en la configuración de Sequelize.

### Paso 2: Iniciar Frontend

```bash
cd Front
ng serve
```

**Verificar:**
```
✅ Compiled successfully
✅ Application running at http://localhost:4200
```

### Paso 3: Login y Verificar WebSocket

1. Abrir `http://localhost:4200`
2. Login con usuario (ej: admin@factura.com / admin123)
3. **Abrir DevTools (F12)**
4. **Verificar Console:**
   ```
   ✅ WebSocket conectado
   ```
5. **Verificar Network → WS:**
   - Debe aparecer conexión a `ws://localhost:3000`
   - Estado: "101 Switching Protocols" (significa conectado)

---

## 🧪 Prueba Rápida del Sistema

### Prueba 1: Notificación de Asignación (Pautas)

**Requisito:** Cliente con pautador asignado (ej: "Empresa Tech Solutions" → Juan Pérez)

**Pasos:**

1. **Ventana Principal: Login como Admin**
   ```
   Email: admin@factura.com
   Password: admin123
   ```

2. **Ventana Incógnito: Login como Pautador**
   ```
   Email: juan.perez@factura.com
   Password: pautador123
   ```
   - Abrir DevTools → Console
   - Verificar: "✅ WebSocket conectado"

3. **Ventana Admin: Crear Petición Pautas**
   - Ir a "Peticiones" → "Nueva Petición"
   - Cliente: Empresa Tech Solutions
   - Área: Pautas
   - Título: "Prueba notificación 1"
   - Descripción: "Testing sistema de notificaciones"
   - Categoría: (cualquiera)
   - Guardar

4. **VERIFICAR en Ventana Pautador:**
   
   ✅ **Console debe mostrar:**
   ```
   📬 Nueva notificación WebSocket: {...}
   🔔 Contador actualizado: 1
   ```

   ✅ **UI debe mostrar:**
   - Toast: "Nueva petición asignada"
   - Bell icon con badge "1" (círculo rojo)
   - Click en bell → Aparece notificación en lista

   ✅ **Click en notificación:**
   - Se marca como leída
   - Navega a /peticiones/[id]
   - Badge disminuye a 0

---

### Prueba 2: Notificación de Aceptación (Diseño)

**Pasos:**

1. **Ventana Admin: Crear Petición Diseño SIN asignar**
   - Área: Diseño
   - Título: "Prueba notificación 2"
   - NO seleccionar diseñador
   - Guardar

2. **Ventana Incógnito: Login como Diseñador**
   ```
   Email: maria.gonzalez@factura.com
   Password: diseñador123
   ```
   - Verificar WebSocket conectado

3. **Ventana Diseñador:**
   - Ir a "Peticiones Pendientes"
   - Encontrar "Prueba notificación 2"
   - Click en "Aceptar"

4. **VERIFICAR en Ventana Admin:**
   
   ✅ **Debe recibir notificación:**
   - Toast: "Petición aceptada"
   - Mensaje: "María González ha aceptado la petición..."
   - Bell icon badge incrementa

---

## 🔍 Verificaciones de Base de Datos

### Verificar que la tabla existe

```sql
SHOW TABLES LIKE 'notificaciones';
```

**Si no existe, ejecutar manualmente:**

```sql
CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('asignacion', 'cambio_estado', 'comentario', 'mencion', 'sistema') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  peticion_id INT NULL,
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura DATETIME NULL,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(uid) ON DELETE CASCADE,
  FOREIGN KEY (peticion_id) REFERENCES peticiones(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_leida (usuario_id, leida),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Ver notificaciones creadas

```sql
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
```

---

## 🐛 Troubleshooting Común

### ❌ Error: "notificaciones table doesn't exist"

**Solución:**
```bash
# Opción 1: Ejecutar script SQL manual (arriba)

# Opción 2: Forzar sync de Sequelize
# En Backend/src/database/connection.ts, cambiar temporalmente:
sequelize.sync({ force: true })  // ⚠️ CUIDADO: Borra todos los datos
# o
sequelize.sync({ alter: true })  // Mejor opción: Solo altera estructura
```

### ❌ WebSocket no conecta

**Verificar:**
1. Backend corriendo en puerto 3000
2. No hay CORS errors en console
3. Token JWT válido en localStorage

**Solución:**
```javascript
// En Frontend, verificar en Console:
localStorage.getItem('token')  // Debe existir
```

### ❌ Notificaciones no llegan en tiempo real

**Diagnóstico:**
```javascript
// Backend console:
Buscar: "📤 Emitiendo notificación a usuario: X"

// Frontend console:
Buscar: "📬 Nueva notificación WebSocket:"
```

**Si Backend emite pero Frontend no recibe:**
1. Verificar que `WS_EVENTS.NUEVA_NOTIFICACION` esté bien escrito (nuevaNotificacion)
2. Reiniciar ambos servidores
3. Hard refresh del navegador (Ctrl+Shift+R)

### ❌ Bell icon no muestra badge

**Verificar en DevTools → Elements:**
```html
<!-- Buscar este elemento: -->
<p-badge [value]="unreadCount$ | async"></p-badge>
```

**Si no aparece:**
1. Verificar que PrimeNG BadgeModule esté importado
2. Verificar que `unreadCount$` tenga valor
3. En Console: Suscribirse manualmente para ver valor
   ```javascript
   // En NotificationCenterComponent
   this.unreadCount$.subscribe(count => console.log('Contador:', count))
   ```

---

## 📊 Endpoints API Disponibles

### Obtener notificaciones
```http
GET /api/notificaciones?leida=false&limit=50
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Notificaciones obtenidas",
  "data": [
    {
      "id": 1,
      "usuario_id": 2,
      "tipo": "asignacion",
      "titulo": "Nueva petición asignada",
      "mensaje": "Se te ha asignado la petición...",
      "peticion_id": 5,
      "leida": false,
      "fecha_creacion": "2024-01-15T10:30:00Z",
      "fecha_lectura": null
    }
  ]
}
```

### Contador de no leídas
```http
GET /api/notificaciones/no-leidas/count
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Contador obtenido",
  "data": { "count": 3 }
}
```

### Marcar como leída
```http
PATCH /api/notificaciones/:id/leida
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Notificación marcada como leída",
  "data": { ... }
}
```

### Marcar todas como leídas
```http
PATCH /api/notificaciones/todas/leidas
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas",
  "data": { "count": 5 }
}
```

### Eliminar notificación
```http
DELETE /api/notificaciones/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Notificación eliminada"
}
```

---

## 🎯 Checklist de Verificación

Antes de dar el sistema como funcional, verificar:

- [ ] Backend corre sin errores
- [ ] Frontend compila sin errores
- [ ] Tabla `notificaciones` existe en BD
- [ ] WebSocket conecta al login
- [ ] Crear petición Pautas → Pautador recibe notificación
- [ ] Aceptar petición → Creador recibe notificación
- [ ] Bell icon muestra badge con contador
- [ ] Click en notificación marca como leída
- [ ] Click en notificación navega a petición
- [ ] Botón "Marcar todas como leídas" funciona
- [ ] Botón eliminar notificación funciona
- [ ] Toast aparece al recibir notificación

---

## 🎉 Sistema Listo

Si todas las pruebas pasaron correctamente, el sistema de notificaciones está completamente funcional y listo para usar en producción.

**Documentación completa:**
- [SISTEMA_NOTIFICACIONES_COMPLETO.md](./SISTEMA_NOTIFICACIONES_COMPLETO.md)
- [IMPLEMENTACION_NOTIFICACIONES_FRONTEND.md](./IMPLEMENTACION_NOTIFICACIONES_FRONTEND.md)

**Próximos pasos opcionales:**
- Solicitar permisos de notificaciones del navegador
- Agregar sonido a las notificaciones
- Implementar notificaciones por email
- Agregar más tipos de eventos

---

**¡Felicidades! El sistema de notificaciones en tiempo real está operativo** 🎊
