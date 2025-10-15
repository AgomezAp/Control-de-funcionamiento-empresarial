# 📝 Registro de Cambios - Sistema de Notificaciones

## Fecha: [Fecha actual]
## Versión: 1.0.0
## Tipo: Nueva Funcionalidad

---

## 🎯 Objetivo

Implementar sistema completo de notificaciones en tiempo real para alertar a los usuarios sobre:
- Asignación automática de peticiones (Pautas)
- Aceptación de peticiones por parte de diseñadores
- Futuros eventos relacionados con peticiones

---

## 📦 Archivos Creados

### Backend

1. **Backend/src/models/Notificacion.ts** ✨ NUEVO
   - Modelo Sequelize para tabla `notificaciones`
   - Campos: id, usuario_id, tipo, titulo, mensaje, peticion_id, leida, fecha_creacion, fecha_lectura
   - Tipos ENUM: asignacion, cambio_estado, comentario, mencion, sistema
   - Índices para optimización de consultas

2. **Backend/src/services/notificacion.service.ts** ✨ NUEVO
   - Servicio de lógica de negocio para notificaciones
   - Métodos:
     - `crear(data)`: Crear notificación + emitir WebSocket
     - `notificarAsignacion(peticion, usuario, asignador)`: Notificación especializada
     - `obtenerPorUsuario(usuario_id, filtros)`: Listar notificaciones
     - `marcarComoLeida(id, usuario_id)`: Marcar como leída
     - `contarNoLeidas(usuario_id)`: Contador de no leídas
     - `eliminar(id, usuario_id)`: Eliminar notificación
     - `eliminarTodas(usuario_id)`: Limpiar todas

3. **Backend/src/routes/notificacion.routes.ts** ✨ NUEVO
   - Rutas HTTP para API REST
   - Endpoints:
     - `GET /api/notificaciones`: Listar con filtros
     - `GET /api/notificaciones/no-leidas/count`: Contador
     - `PATCH /api/notificaciones/:id/leida`: Marcar leída
     - `PATCH /api/notificaciones/todas/leidas`: Marcar todas
     - `DELETE /api/notificaciones/:id`: Eliminar una
     - `DELETE /api/notificaciones`: Eliminar todas

### Frontend

4. **Front/src/app/core/services/notificacion-api.service.ts** ✨ NUEVO
   - Servicio HTTP para comunicación con API REST
   - Métodos correspondientes a endpoints del backend
   - Usa HttpClient de Angular
   - Retorna Observables de ApiResponse<T>

5. **Front/src/app/core/models/notificacion.model.ts** ✅ ACTUALIZADO
   - Sincronizado con modelo del backend
   - Enum TipoNotificacion ajustado
   - Interface Notificacion con tipos correctos (id: number)
   - Agregadas interfaces NotificacionCreate y NotificacionFiltros

6. **Front/src/app/core/services/notificacion.service.ts** ✅ REESCRITO
   - Completamente reescrito de 220 → 273 líneas
   - Integración con NotificacionApiService
   - Integración con WebsocketService
   - Listeners de eventos WebSocket en tiempo real
   - Manejo de estado con BehaviorSubjects
   - Métodos de toast mantenidos (success, error, warning, info)

---

## 📝 Archivos Modificados

### Backend

1. **Backend/src/models/Relaciones.ts**
   - **Línea 3:** Agregado `import Notificacion from "./Notificacion"`
   - **Líneas 55-58:** Agregadas relaciones:
     ```typescript
     Notificacion.belongsTo(Usuario, {foreignKey: "usuario_id", as: "usuario"});
     Notificacion.belongsTo(Peticion, {foreignKey: "peticion_id", as: "peticion"});
     Usuario.hasMany(Notificacion, {foreignKey: "usuario_id", as: "notificaciones"});
     Peticion.hasMany(Notificacion, {foreignKey: "peticion_id", as: "notificaciones"});
     ```
   - **Línea 75:** Agregado `Notificacion` a exports

2. **Backend/src/services/peticion.service.ts**
   - **Línea 10:** Agregado `import notificacionService from "./notificacion.service"`
   - **Líneas 119-126:** Agregada notificación al crear petición Pautas:
     ```typescript
     await notificacionService.notificarAsignacion(
       peticionCompleta,
       usuarioPautador!,
       usuarioActual
     );
     ```
   - **Líneas 195-213:** Agregado cálculo dinámico de `tiempo_empleado_actual` en `obtenerTodos()`
   - **Líneas 258-273:** Agregado cálculo dinámico de `tiempo_empleado_actual` en `obtenerPorId()`
   - **Líneas 382-392:** Agregada notificación al aceptar petición:
     ```typescript
     await notificacionService.crear({
       usuario_id: creador.uid,
       tipo: "cambio_estado",
       titulo: "Petición aceptada",
       mensaje: `${usuarioActual.nombre_completo} ha aceptado...`,
       peticion_id: peticion.id,
     });
     ```

3. **Backend/src/routes/index.ts**
   - **Línea 9:** Agregado `import notificacionRoutes from "./notificacion.routes"`
   - **Línea 21:** Agregado `router.use("/notificaciones", notificacionRoutes)`

### Frontend

4. **Front/src/app/core/services/websocket.service.ts**
   - **Líneas 18-19:** Agregados subjects:
     ```typescript
     private nuevaNotificacion$ = new Subject<any>();
     private contadorNotificaciones$ = new Subject<number>();
     ```
   - **Líneas 102-113:** Agregados listeners de WebSocket:
     ```typescript
     this.socket.on('nuevaNotificacion', (data) => {
       this.nuevaNotificacion$.next(data);
     });
     
     this.socket.on('contadorNotificaciones', (count) => {
       this.contadorNotificaciones$.next(count);
     });
     ```
   - **Líneas 168-175:** Agregados métodos observables:
     ```typescript
     onNuevaNotificacion(): Observable<any>
     onContadorNotificaciones(): Observable<number>
     ```

5. **Front/src/app/core/constants/api.constants.ts**
   - **Líneas 55-61:** Agregado objeto NOTIFICACIONES con endpoints
   - **Líneas 71-72:** Agregados eventos WebSocket:
     ```typescript
     NUEVA_NOTIFICACION: 'nuevaNotificacion',
     CONTADOR_NOTIFICACIONES: 'contadorNotificaciones',
     ```

---

## 🗂️ Base de Datos

### Nueva Tabla: `notificaciones`

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

**Nota:** Sequelize crea esta tabla automáticamente al iniciar si tiene `alter: true` o `sync: true`.

---

## 🔌 API REST Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notificaciones` | Obtener notificaciones del usuario autenticado |
| GET | `/api/notificaciones/no-leidas/count` | Obtener contador de no leídas |
| PATCH | `/api/notificaciones/:id/leida` | Marcar notificación como leída |
| PATCH | `/api/notificaciones/todas/leidas` | Marcar todas como leídas |
| DELETE | `/api/notificaciones/:id` | Eliminar una notificación |
| DELETE | `/api/notificaciones` | Eliminar todas las notificaciones |

**Headers requeridos:** 
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json`

---

## 🔄 Eventos WebSocket

### Eventos Emitidos por el Servidor

1. **`nuevaNotificacion`**
   - Emitido cuando se crea una notificación para un usuario
   - Payload:
     ```json
     {
       "notificacion": {
         "id": 1,
         "usuario_id": 2,
         "tipo": "asignacion",
         "titulo": "Nueva petición asignada",
         "mensaje": "Se te ha asignado...",
         "peticion_id": 5,
         "leida": false,
         "fecha_creacion": "2024-01-15T10:30:00Z"
       }
     }
     ```

2. **`contadorNotificaciones`**
   - Emitido cuando cambia el número de notificaciones no leídas
   - Payload: `3` (número)

---

## 🎨 Cambios en UI

### Componente: NotificationCenterComponent

**Sin cambios necesarios** - Ya era compatible con el nuevo sistema.

**Características:**
- Bell icon con badge de contador
- Panel dropdown con lista de notificaciones
- Botón "Marcar todas como leídas"
- Botón eliminar en cada notificación
- Click en notificación → Marca leída + Navega a petición
- Empty state cuando no hay notificaciones

---

## 📊 Estadísticas de Código

### Líneas de Código Agregadas/Modificadas

**Backend:**
- Notificacion.ts: 47 líneas nuevas
- notificacion.service.ts: 230 líneas nuevas
- notificacion.routes.ts: 95 líneas nuevas
- peticion.service.ts: ~40 líneas modificadas
- Relaciones.ts: ~10 líneas agregadas
- routes/index.ts: 2 líneas agregadas

**Total Backend:** ~424 líneas nuevas

**Frontend:**
- notificacion-api.service.ts: 64 líneas nuevas
- notificacion.model.ts: ~20 líneas modificadas
- notificacion.service.ts: 273 líneas reescritas
- websocket.service.ts: ~20 líneas agregadas
- api.constants.ts: ~15 líneas agregadas

**Total Frontend:** ~392 líneas nuevas/modificadas

**TOTAL GENERAL:** ~816 líneas de código

---

## 🧪 Pruebas Realizadas

### Pruebas Unitarias
- [ ] Pendiente: Tests para notificacion.service (backend)
- [ ] Pendiente: Tests para notificacion-api.service (frontend)
- [ ] Pendiente: Tests para notificacion.service (frontend)

### Pruebas de Integración
- [ ] Verificar creación de notificación en BD
- [ ] Verificar emisión de WebSocket
- [ ] Verificar recepción en frontend
- [ ] Verificar actualización de contador
- [ ] Verificar marca como leída

### Pruebas Manuales
- [ ] Crear petición Pautas → Notificación al pautador
- [ ] Aceptar petición → Notificación al creador
- [ ] Marcar como leída → Actualiza BD y UI
- [ ] Eliminar notificación → Elimina de BD y UI
- [ ] Múltiples tabs → Sincronización en tiempo real

---

## 🐛 Bugs Conocidos

**Ninguno reportado hasta el momento.**

---

## ⚠️ Consideraciones Importantes

1. **WebSocket Scaling:**
   - Actualmente usa Socket.IO en un solo servidor
   - Para múltiples instancias, considerar Redis adapter

2. **Base de Datos:**
   - Las notificaciones pueden crecer rápidamente
   - Considerar implementar limpieza automática de notificaciones antiguas
   - Recomendado: Eliminar notificaciones leídas después de 30 días

3. **Performance:**
   - Índices agregados en `usuario_id+leida` y `fecha_creacion`
   - Query de carga inicial limita a 50 notificaciones
   - Considerar implementar paginación en el futuro

4. **Notificaciones del Navegador:**
   - Requiere permiso explícito del usuario
   - Solo funciona en HTTPS (excepto localhost)
   - Implementar solicitud de permisos en onboarding

5. **Tipos de Notificación:**
   - Actualmente solo 2 tipos están implementados: `asignacion` y `cambio_estado`
   - Otros tipos (`comentario`, `mencion`, `sistema`) están preparados pero sin implementación

---

## 🔮 Roadmap Futuro

### Versión 1.1 (Corto Plazo)
- [ ] Implementar limpieza automática de notificaciones antiguas
- [ ] Agregar sonido configurable
- [ ] Solicitud de permisos del navegador en onboarding
- [ ] Notificaciones para comentarios

### Versión 1.2 (Mediano Plazo)
- [ ] Notificaciones para menciones (@usuario)
- [ ] Notificaciones de peticiones próximas a vencer
- [ ] Preferencias de notificación en perfil de usuario
- [ ] Paginación en lista de notificaciones

### Versión 2.0 (Largo Plazo)
- [ ] Notificaciones por email
- [ ] Push notifications en PWA
- [ ] Notificaciones agrupadas
- [ ] Analytics de notificaciones
- [ ] Resumen diario por email

---

## 📚 Documentación Generada

1. **SISTEMA_NOTIFICACIONES_COMPLETO.md**
   - Arquitectura completa del sistema
   - Diagramas de flujo
   - Troubleshooting detallado

2. **IMPLEMENTACION_NOTIFICACIONES_FRONTEND.md**
   - Detalles específicos del frontend
   - Cambios archivo por archivo
   - Guía de desarrollo

3. **GUIA_INICIO_NOTIFICACIONES.md**
   - Pasos rápidos para probar
   - Checklist de verificación
   - Comandos útiles

4. **REGISTRO_CAMBIOS_NOTIFICACIONES.md** (este archivo)
   - Changelog detallado
   - Lista de archivos modificados
   - Estadísticas

---

## ✅ Checklist de Deployment

### Pre-Deployment
- [x] Código completado
- [x] Sin errores de compilación
- [x] Documentación creada
- [ ] Tests unitarios escritos
- [ ] Tests de integración pasados
- [ ] Code review completado

### Deployment
- [ ] Backup de base de datos
- [ ] Ejecutar migraciones (Sequelize sync)
- [ ] Verificar tabla `notificaciones` creada
- [ ] Deploy backend a producción
- [ ] Build frontend para producción
- [ ] Deploy frontend a producción
- [ ] Verificar WebSocket en producción

### Post-Deployment
- [ ] Smoke tests en producción
- [ ] Verificar logs sin errores
- [ ] Monitorear performance
- [ ] Verificar notificaciones funcionando
- [ ] Comunicar cambios al equipo

---

## 👥 Créditos

**Desarrollado por:** [Tu nombre/equipo]
**Fecha:** [Fecha actual]
**Versión:** 1.0.0

---

## 📞 Soporte

Para problemas o preguntas:
- Revisar documentación en `/SISTEMA_NOTIFICACIONES_COMPLETO.md`
- Consultar troubleshooting en `/GUIA_INICIO_NOTIFICACIONES.md`
- Reportar bugs en el sistema de issues

---

## 📄 Licencia

[Tu licencia aquí]

---

**Última actualización:** [Fecha y hora]
