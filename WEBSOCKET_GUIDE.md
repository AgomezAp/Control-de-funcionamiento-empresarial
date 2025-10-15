# 🔌 Guía de WebSocket - Sistema de Peticiones

## ✅ Implementación Completa

El sistema WebSocket ahora está **100% funcional** tanto en el frontend como en el backend.

---

## 🎯 Arquitectura Implementada

### **Backend (Node.js + Socket.io)**

#### 1. **WebSocket Service** (`src/services/webSocket.service.ts`)
```typescript
class WebSocketService {
  // ✅ Autenticación JWT en handshake
  // ✅ Gestión de salas (rooms)
  // ✅ Tracking de usuarios conectados
  // ✅ Emisión de eventos a todos, salas o usuarios específicos
}
```

**Eventos que emite el backend:**
- `nuevaPeticion` - Cuando se crea una nueva petición
- `cambioEstado` - Cuando cambia el estado de una petición
- `peticionAceptada` - Cuando alguien acepta una petición
- `peticionVencida` - Cuando una petición excede su tiempo límite
- `usuarioOnline` - Cuando un usuario se conecta
- `usuarioOffline` - Cuando un usuario se desconecta

#### 2. **Integración en el Servidor** (`src/models/server.ts`)
```typescript
constructor() {
  this.httpServer = createServer(this.app); // ✅ Servidor HTTP
  webSocketService.initialize(this.httpServer); // ✅ WebSocket inicializado
}
```

#### 3. **Integración con Peticiones** (`src/services/peticion.service.ts`)
```typescript
// Al crear petición
webSocketService.emitNuevaPeticion(peticionCompleta);

// Al aceptar petición
webSocketService.emitPeticionAceptada(...);

// Al cambiar estado
webSocketService.emitCambioEstado(...);
```

#### 4. **Cron Jobs** (`src/jobs/peticion.cron.ts`)
```typescript
// Detecta peticiones vencidas cada 30 minutos
webSocketService.emitPeticionVencida(peticionId, peticion);
```

---

### **Frontend (Angular + Socket.io-client)**

#### 1. **WebSocket Service** (`src/app/core/services/websocket.service.ts`)
```typescript
class WebsocketService {
  connect() // ✅ Conecta con JWT
  disconnect() // ✅ Desconecta limpiamente
  
  // Listeners
  onNuevaPeticion(): Observable<any>
  onCambioEstado(): Observable<any>
  onPeticionAceptada(): Observable<any>
  onPeticionVencida(): Observable<any>
  
  // Emisores
  joinRoom(room: string)
  leaveRoom(room: string)
  typing(peticionId: number)
}
```

#### 2. **Gestión Global** (`app.component.ts`)
```typescript
ngOnInit() {
  this.authService.currentUser$.subscribe(user => {
    if (user) {
      this.websocketService.connect(); // ✅ Conecta al autenticar
    } else {
      this.websocketService.disconnect(); // ✅ Desconecta al logout
    }
  });
}
```

#### 3. **Lista de Peticiones** (`lista-peticiones.component.ts`)
```typescript
setupWebSocketListeners() {
  // ✅ Nuevas peticiones aparecen automáticamente
  this.websocketService.onNuevaPeticion().subscribe(...)
  
  // ✅ Estados se actualizan en tiempo real
  this.websocketService.onCambioEstado().subscribe(...)
  
  // ✅ Notificaciones toast para todos los eventos
}
```

#### 4. **Detalle de Petición** (`detalle-peticion.component.ts`)
```typescript
setupWebSocketListeners() {
  this.websocketService.joinRoom(`peticion_${this.peticionId}`); // ✅ Sala específica
  
  // ✅ Actualizaciones en tiempo real en la vista de detalle
  this.websocketService.onCambioEstado().subscribe(...)
  this.websocketService.onPeticionAceptada().subscribe(...)
}
```

---

## 🚀 Cómo Probar el Sistema

### 1. **Iniciar Backend**
```bash
cd Backend
npm run typescript  # Terminal 1 - Compilar TypeScript
npm run dev         # Terminal 2 - Ejecutar servidor
```

**Deberías ver:**
```
✅ Conectado a la base de datos PostgreSQL con éxito
✅ Modelos sincronizados con la base de datos
✅ WebSocket Service initialized
✅ WebSocket inicializado correctamente
   🔌 Socket.IO escuchando en puerto: 3010
🚀 Servidor corriendo en puerto: 3010
🔗 URL: http://localhost:3010
📚 API: http://localhost:3010/api
🔌 WebSocket: ws://localhost:3010
```

### 2. **Iniciar Frontend**
```bash
cd Front
ng serve
```

### 3. **Abrir Múltiples Navegadores**
Para probar WebSocket necesitas **2+ ventanas del navegador**:

1. **Navegador 1**: `http://localhost:4200` → Login como Usuario 1
2. **Navegador 2**: `http://localhost:4200` → Login como Usuario 2

---

## 🧪 Escenarios de Prueba

### **Escenario 1: Nueva Petición**
1. **Usuario 1** crea una nueva petición
2. **Usuario 2** ve aparecer la petición instantáneamente sin recargar
3. Ambos ven toast notification: "Nueva petición #123 creada por Juan Pérez"

### **Escenario 2: Aceptar Petición**
1. **Usuario 1** ve lista de peticiones pendientes
2. **Usuario 2** acepta una petición con 24 horas
3. **Usuario 1** ve:
   - Estado cambia de "Pendiente" a "En Progreso"
   - Aparece timer con cuenta regresiva
   - Toast: "Petición #123 aceptada por María López"

### **Escenario 3: Vista de Detalle**
1. **Usuario 1** abre detalle de petición #123
2. **Usuario 2** marca la petición como "Resuelta"
3. **Usuario 1** ve:
   - Estado actualizado instantáneamente
   - Fecha de resolución aparece
   - Toast: "La petición cambió a Resuelta"

### **Escenario 4: Petición Vencida**
1. Esperar a que el cron job detecte petición vencida (cada 30 min)
2. Todos los usuarios conectados ven:
   - Toast rojo sticky: "Petición #123 ha excedido el tiempo límite"
   - Estado se mantiene pero hay alerta visual

---

## 📊 Monitoreo en Consola

### **Backend Console Logs:**
```
✅ Cliente conectado: abc123 - Usuario: 5
🔐 Usuario autenticado: juan@example.com (ID: 5)
📥 Usuario 5 se unió a la sala: peticion_123
📡 Evento emitido: nuevaPeticion
📡 Evento emitido a sala peticion_123: cambioEstado
❌ Cliente desconectado: abc123 - Usuario: 5
```

### **Frontend Console Logs:**
```
👤 Usuario autenticado, conectando WebSocket...
✅ WebSocket conectado correctamente
🆕 Nueva petición recibida: { id: 123, cliente: 'ABC Corp' }
🔄 Estado actualizado en tiempo real: { peticionId: 123, nuevoEstado: 'En Progreso' }
✅ Petición aceptada en tiempo real: { peticionId: 123, usuario: 'María López' }
⚠️ Petición vencida en tiempo real
```

---

## 🔧 Configuración

### **Variables de Entorno Backend** (`.env`)
```env
PORT=3010
JWT_SECRET=tu_secreto_jwt
FRONTEND_URL=http://localhost:4200
```

### **Variables de Entorno Frontend** (`environments.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3010/api',
  wsUrl: 'http://localhost:3010'  // ✅ URL para WebSocket
};
```

---

## 🛡️ Seguridad

### **Autenticación JWT**
```typescript
// Backend valida token en handshake
socket.handshake.auth.token // ✅ Verificado con JWT

// Frontend envía token automáticamente
io(environment.wsUrl, {
  auth: { token } // ✅ Token del AuthService
})
```

### **Autorización por Salas**
```typescript
// Solo usuarios autorizados pueden ver peticiones específicas
socket.join(`peticion_${id}`); // ✅ Salas privadas por petición
```

---

## 📈 Casos de Uso Implementados

| **Evento** | **Emisor** | **Receptores** | **Acción** |
|------------|------------|----------------|------------|
| Nueva Petición | PeticionService.crear() | Todos | Aparece en lista |
| Aceptar Petición | PeticionService.aceptarPeticion() | Todos + Sala específica | Estado → "En Progreso" |
| Cambio Estado | PeticionService.cambiarEstado() | Todos + Sala específica | Actualiza vista |
| Petición Vencida | Cron Job (cada 30 min) | Todos | Alerta roja |
| Usuario Online | WebSocket.connect() | Todos | Badge verde |
| Usuario Offline | WebSocket.disconnect() | Todos | Badge gris |

---

## 🐛 Solución de Problemas

### **Error: "WebSocket connection failed: 404"**
**Causa:** Backend no tiene WebSocket inicializado
**Solución:** ✅ Ya implementado en `server.ts`

### **Error: "Authentication error"**
**Causa:** JWT token inválido o expirado
**Solución:** 
1. Verificar `JWT_SECRET` en backend
2. Hacer logout/login en frontend

### **No recibo eventos**
**Causa:** No estás conectado o no suscrito
**Solución:**
1. Verificar console: "✅ WebSocket conectado"
2. Verificar que estés autenticado
3. Verificar que el backend esté corriendo

---

## ✨ Próximas Mejoras

### **Chat en Tiempo Real** 🚀
```typescript
// Ya está la base, solo falta implementar:
webSocketService.emitNuevoComentario(peticionId, comentario);
```

### **Indicador de "Escribiendo..."** 💬
```typescript
// Ya implementado:
websocketService.typing(peticionId);
websocketService.stopTyping(peticionId);
```

### **Notificaciones Push** 🔔
```typescript
// Integrar con Service Worker
if ('Notification' in window) {
  Notification.requestPermission();
}
```

---

## 📚 Recursos

- **Socket.io Docs**: https://socket.io/docs/v4/
- **RxJS Docs**: https://rxjs.dev/
- **PrimeNG Toast**: https://primeng.org/toast

---

