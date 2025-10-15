# Sistema de Notificaciones en Tiempo Real - Frontend

## 📋 Resumen de Cambios

Se ha implementado el sistema completo de notificaciones en tiempo real en el frontend de Angular para conectar con el backend API y recibir notificaciones mediante WebSocket.

## 🔧 Archivos Modificados

### 1. **Modelo de Notificación** (`Front/src/app/core/models/notificacion.model.ts`)

**Cambios:**
- Actualizado el enum `TipoNotificacion` para coincidir con el backend:
  - Cambiado de mayúsculas (NUEVA_PETICION) a minúsculas con guiones bajos (asignacion, cambio_estado, comentario, mencion, sistema)
- Actualizada la interfaz `Notificacion`:
  - `id`: string → number
  - `fecha`: Date → `fecha_creacion`: Date
  - Agregado: `fecha_lectura?: Date`
  - Agregado: `usuario_id: number`
- Agregadas interfaces nuevas:
  - `NotificacionCreate`: Para crear notificaciones
  - `NotificacionFiltros`: Para filtrar notificaciones (leida, limit)
- Eliminada: `NotificacionPush` (no se usa)

```typescript
export enum TipoNotificacion {
  ASIGNACION = 'asignacion',
  CAMBIO_ESTADO = 'cambio_estado',
  COMENTARIO = 'comentario',
  MENCION = 'mencion',
  SISTEMA = 'sistema'
}

export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  peticion_id?: number;
  leida: boolean;
  fecha_creacion: Date;
  fecha_lectura?: Date;
  peticion?: any;
}
```

---

### 2. **Nuevo Servicio API** (`Front/src/app/core/services/notificacion-api.service.ts`) ✨ NUEVO

**Propósito:** Servicio HTTP para comunicarse con el backend API de notificaciones.

**Métodos:**
- `getAll(filtros?)`: Obtener todas las notificaciones del usuario con filtros opcionales
- `getUnreadCount()`: Obtener el contador de notificaciones no leídas
- `markAsRead(id)`: Marcar una notificación como leída
- `markAllAsRead()`: Marcar todas las notificaciones como leídas
- `delete(id)`: Eliminar una notificación
- `deleteAll()`: Eliminar todas las notificaciones del usuario

**Endpoints utilizados:**
```typescript
GET    /api/notificaciones              // Obtener todas
GET    /api/notificaciones/no-leidas/count  // Contador no leídas
PATCH  /api/notificaciones/:id/leida     // Marcar leída
PATCH  /api/notificaciones/todas/leidas  // Marcar todas leídas
DELETE /api/notificaciones/:id           // Eliminar una
DELETE /api/notificaciones               // Eliminar todas
```

---

### 3. **Servicio de WebSocket** (`Front/src/app/core/services/websocket.service.ts`)

**Cambios:**
- Agregados dos nuevos subjects para notificaciones:
  ```typescript
  private nuevaNotificacion$ = new Subject<any>();
  private contadorNotificaciones$ = new Subject<number>();
  ```

- Agregados listeners en `setupEventListeners()`:
  ```typescript
  this.socket.on('nuevaNotificacion', (data: any) => {
    console.log('📬 Nueva notificación recibida:', data);
    this.nuevaNotificacion$.next(data);
  });

  this.socket.on('contadorNotificaciones', (count: number) => {
    console.log('🔔 Contador de notificaciones actualizado:', count);
    this.contadorNotificaciones$.next(count);
  });
  ```

- Agregados métodos observables:
  ```typescript
  onNuevaNotificacion(): Observable<any>
  onContadorNotificaciones(): Observable<number>
  ```

---

### 4. **Servicio de Notificaciones** (`Front/src/app/core/services/notificacion.service.ts`)

**COMPLETAMENTE REESCRITO** ✨

**Antes:** Solo manejaba notificaciones locales con toast/alertas usando localStorage

**Ahora:** Sistema completo integrado con backend + WebSocket

**Nuevas características:**

1. **Integración con WebSocket:**
   - Escucha evento `nuevaNotificacion` → Agrega notificación a la lista local
   - Escucha evento `contadorNotificaciones` → Actualiza badge del bell icon
   - Muestra toast cuando llega notificación nueva
   - Muestra notificación del navegador (si está permitido)

2. **Carga desde Backend:**
   - `loadNotificaciones()`: Carga las últimas 50 notificaciones al iniciar
   - `loadUnreadCount()`: Carga el contador de no leídas

3. **Operaciones CRUD:**
   - `markAsRead(id)`: Marca notificación como leída → Actualiza backend + UI
   - `markAllAsRead()`: Marca todas como leídas → Actualiza backend + UI
   - `delete(id)`: Elimina notificación → Actualiza backend + UI
   - `clear()`: Elimina todas las notificaciones → Actualiza backend + UI

4. **Métodos de Toast (mantenidos):**
   - `success(mensaje, titulo?)`
   - `error(mensaje, titulo?)`
   - `warning(mensaje, titulo?)`
   - `info(mensaje, titulo?)`

5. **Notificaciones del Navegador:**
   - `requestPermission()`: Solicita permiso al usuario
   - `hasPermission()`: Verifica si tiene permiso
   - `showBrowserNotification()`: Muestra notificación nativa del navegador

**Flujo completo:**
```
Backend crea notificación
     ↓
WebSocket emite "nuevaNotificacion"
     ↓
websocketService.onNuevaNotificacion() recibe
     ↓
NotificacionService.agregarNotificacion()
     ↓
- Agrega a lista local (notificaciones$)
- Muestra toast
- Muestra notificación del navegador
- Actualiza UI automáticamente
```

---

### 5. **Constantes API** (`Front/src/app/core/constants/api.constants.ts`)

**Agregado endpoint de notificaciones:**
```typescript
NOTIFICACIONES: {
  BASE: `${environment.apiUrl}/notificaciones`,
  NO_LEIDAS_COUNT: `${environment.apiUrl}/notificaciones/no-leidas/count`,
  MARCAR_LEIDA: (id: number) => `${environment.apiUrl}/notificaciones/${id}/leida`,
  MARCAR_TODAS_LEIDAS: `${environment.apiUrl}/notificaciones/todas/leidas`,
  BY_ID: (id: number) => `${environment.apiUrl}/notificaciones/${id}`,
}
```

**Agregados eventos WebSocket:**
```typescript
WS_EVENTS: {
  // ... eventos existentes
  NUEVA_NOTIFICACION: 'nuevaNotificacion',
  CONTADOR_NOTIFICACIONES: 'contadorNotificaciones',
}
```

---

## 🚀 Funcionamiento

### Flujo de Notificaciones en Tiempo Real

1. **Usuario A crea petición Pautas** → Se asigna automáticamente a Pautador
   ```
   Backend: peticion.service.crear()
       ↓
   Backend: notificacionService.notificarAsignacion()
       ↓
   Backend: webSocketService.emitToUser(pautadorId, 'nuevaNotificacion', ...)
       ↓
   Frontend: websocketService.onNuevaNotificacion()
       ↓
   Frontend: NotificacionService.agregarNotificacion()
       ↓
   🔔 Bell icon se actualiza con contador
   🍞 Toast aparece en pantalla
   🖥️ Notificación del navegador (si está permitida)
   ```

2. **Diseñador acepta petición** → Notifica al creador
   ```
   Backend: peticion.service.aceptar()
       ↓
   Backend: notificacionService.crear()
       ↓
   WebSocket emite a creador
       ↓
   Frontend actualiza automáticamente
   ```

### Componentes Conectados

El componente `NotificationCenterComponent` ya está conectado:
- Escucha `notificaciones$` → Muestra lista de notificaciones
- Escucha `unreadCount$` → Muestra badge en bell icon
- Click en notificación → Marca como leída + Navega a petición
- Botón "Marcar todas como leídas" → Llama markAllAsRead()
- Botón "Eliminar" en notificación → Llama delete(id)

---

## 📊 Estado de Implementación

### ✅ Completado en Frontend

- ✅ Modelo de Notificación actualizado
- ✅ Servicio HTTP API de notificaciones creado
- ✅ Servicio WebSocket actualizado con listeners
- ✅ Servicio de notificaciones completamente integrado
- ✅ Constantes API actualizadas
- ✅ Componente NotificationCenter ya existente y compatible

### ⏳ Pendiente de Probar

1. **Conectar el backend y frontend**
   - Asegurarse de que el backend esté corriendo
   - Verificar que las tablas de notificaciones existan en la base de datos

2. **Sincronizar base de datos**
   ```bash
   cd Backend
   npm run dev
   ```
   - Sequelize debería crear automáticamente la tabla `notificaciones`

3. **Iniciar frontend**
   ```bash
   cd Front
   ng serve
   ```

4. **Probar flujo completo:**
   - Login con usuario Admin
   - Crear petición Pautas para cliente con pautador asignado
   - Login con el Pautador en otra pestaña/navegador
   - ✨ El pautador debería ver:
     - Toast de notificación
     - Bell icon con badge "1"
     - Notificación en el panel de notificaciones
     - (Opcional) Notificación del navegador

---

## 🎯 Próximos Pasos

1. **Prueba del sistema:**
   - Crear peticiones y verificar notificaciones
   - Verificar WebSocket en DevTools (Network → WS)
   - Revisar console.log para eventos de notificaciones

2. **Navegación automática:**
   - Verificar que al hacer click en notificación navegue a la petición correcta

3. **Permisos del navegador:**
   - Implementar botón para solicitar permisos de notificaciones
   - Agregar en configuración de usuario

4. **Optimizaciones futuras:**
   - Implementar paginación en lista de notificaciones
   - Agregar filtros por tipo de notificación
   - Implementar limpieza automática de notificaciones antiguas (30+ días)
   - Agregar notificaciones por email (opcional)

---

## 🐛 Troubleshooting

### No aparecen notificaciones

1. **Verificar WebSocket conectado:**
   ```
   Abrir DevTools → Console
   Buscar: "✅ WebSocket conectado"
   ```

2. **Verificar backend corriendo:**
   ```
   Backend debe estar en http://localhost:3000
   ```

3. **Verificar eventos en console:**
   ```javascript
   // Buscar en console:
   "📬 Nueva notificación WebSocket:"
   "🔔 Contador actualizado:"
   ```

### Notificaciones no se cargan al inicio

1. **Verificar llamada API:**
   ```
   DevTools → Network → XHR
   Buscar: GET /api/notificaciones
   ```

2. **Verificar autenticación:**
   ```
   Asegurarse de que el token JWT esté en headers
   ```

### Bell icon no muestra contador

1. **Verificar observable:**
   ```typescript
   // En el componente:
   console.log(this.unreadCount$); // Debe emitir valores
   ```

2. **Verificar API:**
   ```
   GET /api/notificaciones/no-leidas/count
   Debe retornar: { success: true, data: { count: X } }
   ```

---

## 📝 Notas Técnicas

- **RxJS:** Se utilizan `BehaviorSubject` para mantener estado reactivo
- **WebSocket:** Conexión persistente establecida al login (app.component.ts línea 35)
- **Tipos:** Enum TipoNotificacion sincronizado con backend
- **API Response:** Usa `ApiResponse<T>` con propiedad `success` (no `ok`)
- **Permisos navegador:** Notificaciones nativas requieren permiso explícito del usuario
- **Cleanup:** Al logout, el WebSocket se desconecta automáticamente

---

## 🎉 Resultado Final

El usuario ahora tiene un sistema completo de notificaciones en tiempo real:

- 🔔 Bell icon con badge de contador
- 📬 Panel de notificaciones con lista actualizada en tiempo real
- 🍞 Toast notifications al recibir notificaciones
- 🖥️ Notificaciones del navegador (opcional)
- ✅ Marcar como leída/no leída
- 🗑️ Eliminar notificaciones
- 🔗 Navegación directa a la petición relacionada

Todo esto se sincroniza automáticamente con el backend mediante WebSocket y API REST.
