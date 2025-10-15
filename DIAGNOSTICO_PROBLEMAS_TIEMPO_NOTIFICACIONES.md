# 🔧 Diagnóstico y Solución de Problemas

## Fecha: 15 de Octubre de 2025

---

## 🐛 Problema 1: Tiempo Empleado Siempre en 0

### ✅ Solución Aplicada

**Causa Raíz:** El frontend estaba mostrando `tiempo_empleado_segundos` (valor almacenado) en lugar de `tiempo_empleado_actual` (valor calculado en tiempo real).

**Archivos Corregidos:**

1. **Front/src/app/core/models/peticion.model.ts**
   - ✅ Agregado campo `tiempo_empleado_actual?: number`

2. **Front/src/app/features/peticiones/components/lista-peticiones/lista-peticiones.component.html**
   - ✅ Línea 253: Cambiado a usar `tiempo_empleado_actual`
   - ✅ Línea 408: Cambiado a usar `tiempo_empleado_actual`

3. **Front/src/app/features/peticiones/components/detalle-peticion/detalle-peticion.component.html**
   - ✅ Línea 133: Cambiado a usar `tiempo_empleado_actual`

**Cambio aplicado:**
```typescript
// ANTES (INCORRECTO):
{{ formatearTiempo(peticion.tiempo_empleado_segundos || 0) }}

// AHORA (CORRECTO):
{{ formatearTiempo(peticion.tiempo_empleado_actual ?? peticion.tiempo_empleado_segundos ?? 0) }}
```

**Explicación:**
- `tiempo_empleado_actual` es calculado dinámicamente por el backend
- Incluye el tiempo del temporizador activo si está corriendo
- Si no existe, usa el valor almacenado como fallback

---

## 🔔 Problema 2: Notificaciones No Aparecen

### 🔍 Diagnóstico Necesario

Para que las notificaciones funcionen, necesitamos verificar:

#### 1. ¿El Backend está corriendo?

**Verificar:**
```bash
cd Backend
npm run dev
```

**Debe mostrar:**
```
✅ Servidor corriendo en puerto 3000
✅ BD conectada
```

---

#### 2. ¿La tabla `notificaciones` existe en la base de datos?

**Verificar con MySQL:**
```sql
USE factura_db;
SHOW TABLES LIKE 'notificaciones';
```

**Si NO existe, ejecutar:**
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
  
  CONSTRAINT fk_notificacion_usuario 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(uid) ON DELETE CASCADE,
  CONSTRAINT fk_notificacion_peticion 
    FOREIGN KEY (peticion_id) REFERENCES peticiones(id) ON DELETE CASCADE,
  
  INDEX idx_usuario_leida (usuario_id, leida),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

#### 3. ¿El WebSocket está conectado?

**Verificar en el navegador:**
1. Abrir DevTools (F12)
2. Ir a la pestaña **Console**
3. Buscar mensaje: `✅ WebSocket conectado`

**Si NO aparece:**
- Verificar que el backend esté corriendo
- Verificar en Network → WS que exista conexión a `ws://localhost:3000`

---

#### 4. ¿El endpoint de notificaciones funciona?

**Probar manualmente con Postman o curl:**

```bash
# Obtener notificaciones (reemplaza TOKEN con tu JWT)
curl -X GET http://localhost:3000/api/notificaciones \
  -H "Authorization: Bearer TOKEN"

# Debe retornar:
{
  "success": true,
  "message": "Notificaciones obtenidas",
  "data": [...]
}
```

**Si da error 404:**
- Verificar que `Backend/src/routes/index.ts` tenga:
  ```typescript
  router.use("/notificaciones", notificacionRoutes);
  ```

---

#### 5. ¿Se están creando notificaciones al asignar peticiones?

**Probar creando una petición Pautas:**

1. Login como Admin
2. Crear petición "Pautas" para cliente con pautador asignado
3. **Verificar en la BD:**
   ```sql
   SELECT * FROM notificaciones ORDER BY fecha_creacion DESC LIMIT 5;
   ```

**Si NO hay registros:**
- Verificar que `Backend/src/services/peticion.service.ts` tenga la integración:
  ```typescript
  await notificacionService.notificarAsignacion(
    peticionCompleta,
    usuarioPautador!,
    usuarioActual
  );
  ```

---

## 🚀 Pasos de Verificación Completos

### Paso 1: Verificar Backend

```bash
cd Backend
npm run dev
```

**Buscar en console:**
- ✅ `Servidor corriendo en puerto 3000`
- ✅ `BD conectada`
- ✅ Sin errores de Sequelize

---

### Paso 2: Verificar Base de Datos

```sql
-- Conectar a MySQL
mysql -u root -p

-- Usar la BD
USE factura_db;

-- Verificar tablas
SHOW TABLES;

-- Debe aparecer: notificaciones

-- Ver estructura
DESCRIBE notificaciones;

-- Ver notificaciones existentes
SELECT * FROM notificaciones LIMIT 5;
```

---

### Paso 3: Verificar Frontend

```bash
cd Front
ng serve
```

**Debe compilar sin errores.**

---

### Paso 4: Probar Flujo Completo

#### A. Login y Verificar WebSocket

1. Abrir `http://localhost:4200`
2. Login (ej: admin@factura.com)
3. **Abrir DevTools (F12) → Console**
4. **Verificar mensajes:**
   ```
   ✅ WebSocket conectado
   ```

#### B. Verificar Carga de Notificaciones

**En Console del navegador, buscar:**
```
GET http://localhost:3000/api/notificaciones
Status: 200 OK
```

**Si aparece error 401 o 403:**
- Token JWT inválido o expirado
- Logout y login nuevamente

**Si aparece error 404:**
- Ruta `/notificaciones` no está registrada
- Verificar `Backend/src/routes/index.ts`

#### C. Crear Petición y Verificar Notificación

**Setup:**
1. **Ventana 1:** Login como Admin (admin@factura.com)
2. **Ventana 2 (incógnito):** Login como Pautador (juan.perez@factura.com)

**En Ventana 2 (Pautador):**
- Abrir DevTools → Console
- Verificar WebSocket conectado

**En Ventana 1 (Admin):**
- Ir a "Crear Petición"
- Cliente: **Empresa Tech Solutions** (tiene pautador asignado)
- Área: **Pautas**
- Título: "Prueba notificación"
- Descripción: "Testing"
- Guardar

**VERIFICAR en Ventana 2 (Pautador):**

✅ **Console debe mostrar:**
```javascript
📬 Nueva notificacion WebSocket: {...}
🔔 Contador actualizado: 1
```

✅ **UI debe mostrar:**
- Toast: "Nueva petición asignada"
- Bell icon (campanita) con badge "1"

✅ **Click en campanita:**
- Panel se abre
- Aparece notificación: "Nueva petición asignada"
- Mensaje indica el cliente y detalles

---

## 🔴 Problemas Comunes

### Problema: WebSocket no conecta

**Síntomas:**
- No aparece mensaje "WebSocket conectado"
- Notificaciones no llegan en tiempo real

**Soluciones:**
1. Verificar backend corriendo en puerto 3000
2. Hard refresh del navegador (Ctrl+Shift+R)
3. Limpiar caché y cookies
4. Verificar que no haya errores CORS en console

---

### Problema: Bell icon no muestra contador

**Síntomas:**
- Notificaciones existen en BD
- Pero badge no aparece

**Soluciones:**
1. Verificar endpoint `/api/notificaciones/no-leidas/count`
2. En Console del navegador:
   ```javascript
   fetch('http://localhost:3000/api/notificaciones/no-leidas/count', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token')
     }
   }).then(r => r.json()).then(console.log)
   ```
3. Debe retornar: `{ success: true, data: { count: X } }`

---

### Problema: Notificaciones no se crean en BD

**Síntomas:**
- Crear petición pero no aparece registro en tabla `notificaciones`

**Verificar:**
1. **Backend console al crear petición:**
   - Buscar: `📬 Notificación creada para usuario: X`
   - Buscar: `📤 Emitiendo notificación a usuario: X`

2. **Si NO aparecen esos logs:**
   - Verificar que `notificacionService` esté importado en `peticion.service.ts`
   - Verificar que la llamada a `notificarAsignacion()` exista

---

### Problema: Tiempo empleado sigue en 0

**Síntomas:**
- Después de aplicar cambios, sigue mostrando 00:00:00

**Soluciones:**
1. Hard refresh del navegador (Ctrl+Shift+R)
2. Verificar en Network → XHR:
   - GET `/api/peticiones`
   - Response debe incluir campo `tiempo_empleado_actual`
3. Si NO existe `tiempo_empleado_actual` en response:
   - Verificar que `Backend/src/services/peticion.service.ts` tenga el cálculo
   - Reiniciar backend

---

## 📊 Checklist de Verificación

### Backend
- [ ] Backend corriendo sin errores
- [ ] Tabla `notificaciones` existe
- [ ] Endpoint `/api/notificaciones` responde
- [ ] Endpoint `/api/notificaciones/no-leidas/count` responde
- [ ] Log "Notificación creada" aparece al crear petición
- [ ] WebSocket emite eventos

### Frontend
- [ ] Frontend compila sin errores
- [ ] WebSocket conecta al login
- [ ] Mensaje "WebSocket conectado" en console
- [ ] Llamada GET `/api/notificaciones` se ejecuta al iniciar
- [ ] Bell icon aparece en navbar
- [ ] Modelo `Notificacion` tiene campos correctos

### Integración
- [ ] Crear petición Pautas genera notificación
- [ ] Notificación aparece en BD
- [ ] WebSocket emite a usuario correcto
- [ ] Toast aparece en frontend
- [ ] Bell icon muestra badge con contador
- [ ] Click en notificación navega a petición

---

## 🎯 Próximos Pasos

1. **Ejecutar Backend:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Verificar Tabla:**
   ```sql
   SHOW TABLES LIKE 'notificaciones';
   ```
   - Si NO existe, ejecutar CREATE TABLE de arriba

3. **Ejecutar Frontend:**
   ```bash
   cd Front
   ng serve
   ```

4. **Probar:**
   - Login
   - Verificar WebSocket en console
   - Crear petición Pautas
   - Verificar notificación en campanita

---

## 📞 Comandos Útiles para Debugging

### Ver logs del backend en tiempo real
```bash
cd Backend
npm run dev | grep -E "(notificacion|WebSocket|Emitiendo)"
```

### Verificar estado de la BD
```sql
-- Contar notificaciones por usuario
SELECT usuario_id, COUNT(*) as total, SUM(leida = 0) as no_leidas
FROM notificaciones
GROUP BY usuario_id;

-- Ver últimas notificaciones
SELECT 
  n.id,
  u.nombre_completo,
  n.tipo,
  n.titulo,
  n.leida,
  n.fecha_creacion
FROM notificaciones n
LEFT JOIN usuarios u ON n.usuario_id = u.uid
ORDER BY n.fecha_creacion DESC
LIMIT 10;
```

### Verificar WebSocket en frontend
```javascript
// En Console del navegador:
// Ver si hay conexión WS activa
navigator.webkitGetUserMedia ? 'WebSocket available' : 'WebSocket not available'
```

---

## ✅ Resumen

**Problemas identificados:**
1. ✅ **Tiempo empleado en 0:** SOLUCIONADO - Cambiado a usar `tiempo_empleado_actual`
2. ⏳ **Notificaciones no funcionan:** REQUIERE VERIFICACIÓN

**Para resolver notificaciones:**
1. Verificar backend corriendo
2. Verificar tabla `notificaciones` existe
3. Verificar WebSocket conecta
4. Probar crear petición y ver logs

**Si sigues con problemas:**
- Compartir los logs de console del navegador
- Compartir los logs del backend
- Verificar la BD con las queries SQL de arriba
