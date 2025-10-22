# 🔄 Sistema de Transferencia de Peticiones - Documentación Completa

## 📋 Resumen
Sistema completo para transferir peticiones entre usuarios, con permisos exclusivos para Admin, Directivo y Líder. Permite reasignar múltiples peticiones cuando un usuario está de vacaciones, se va de la empresa, o por redistribución de carga.

---

## 🎯 Características Principales

### 1. **Distribución Inteligente**
- Distribución equitativa round-robin entre múltiples usuarios destino
- Ejemplo: 10 peticiones → 3 usuarios destino = 4, 3, 3 peticiones respectivamente

### 2. **Validaciones Robustas**
- Solo peticiones en estados: `Pendiente`, `En Progreso`, `Pausada`
- No se pueden transferir peticiones `Resueltas` o `Canceladas`
- Verifica que usuarios destino existan y estén activos (`status = true`)
- Solo permite transferir peticiones asignadas al usuario origen

### 3. **Auditoría Completa**
- Registro en tabla `auditoria_cambios` con tipo `ASIGNACION`
- Tracking de usuario origen, destino y motivo de transferencia
- Timestamp de cada cambio

### 4. **Notificaciones Automáticas**
- Usuario(s) destino: "Se te ha asignado la petición #X del cliente Y"
- Usuario origen: "Se han transferido N peticiones. Motivo: Z"

### 5. **Manejo de Temporizadores**
- Si petición estaba con temporizador activo → se pausa automáticamente
- Se guarda el tiempo empleado hasta el momento
- Fecha de pausa registrada en `fecha_pausa_temporizador`

---

## 🔧 Backend - Implementación

### **Endpoint: POST /api/peticiones/transferir**

**Permisos**: Admin, Directivo, Líder (middleware `roleAuth`)

**Request Body**:
```json
{
  "usuario_origen_id": 5,
  "peticiones_ids": [12, 15, 18, 22],
  "usuarios_destino_ids": [8, 10],
  "motivo": "Usuario de vacaciones por 2 semanas"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "total_transferidas": 4,
    "usuario_origen": {
      "id": 5,
      "nombre": "Juan Pérez - Pautador"
    },
    "distribucion": [
      {
        "usuario_id": 8,
        "usuario_nombre": "María García - Pautadora",
        "peticiones_asignadas": 2
      },
      {
        "usuario_id": 10,
        "usuario_nombre": "Carlos López - Diseñador",
        "peticiones_asignadas": 2
      }
    ],
    "detalle": [
      {
        "peticion_id": 12,
        "usuario_destino_id": 8,
        "usuario_destino_nombre": "María García - Pautadora"
      },
      {
        "peticion_id": 15,
        "usuario_destino_id": 10,
        "usuario_destino_nombre": "Carlos López - Diseñador"
      },
      // ... resto de peticiones
    ]
  },
  "message": "Peticiones transferidas exitosamente"
}
```

**Errores Comunes**:
```json
// 403 Forbidden
{
  "success": false,
  "message": "No tienes permisos para transferir peticiones"
}

// 404 Not Found
{
  "success": false,
  "message": "Usuario origen no encontrado"
}

// 400 Bad Request
{
  "success": false,
  "message": "Uno o más usuarios destino no existen o están inactivos"
}

// 400 Bad Request
{
  "success": false,
  "message": "Algunas peticiones no existen, no pertenecen al usuario origen o ya están finalizadas"
}
```

### **Servicio: PeticionService.transferirPeticiones()**

**Ubicación**: `Backend/src/services/peticion.service.ts`

**Lógica Detallada**:

1. **Verificar permisos** del usuario actual
2. **Validar existencia** de usuario origen
3. **Verificar usuarios destino** (existen y están activos)
4. **Obtener peticiones** con filtros:
   ```typescript
   where: {
     id: peticionesIds,
     asignado_a: usuarioOrigenId,
     estado: { [Op.in]: ["Pendiente", "En Progreso", "Pausada"] }
   }
   ```
5. **Distribuir round-robin**:
   ```typescript
   let indiceUsuarioActual = 0;
   for (const peticion of peticiones) {
     const usuarioDestinoId = usuariosDestinoIds[indiceUsuarioActual];
     // Actualizar peticion...
     indiceUsuarioActual = (indiceUsuarioActual + 1) % usuariosDestinoIds.length;
   }
   ```
6. **Pausar temporizador** si estaba activo:
   ```typescript
   ...(peticion.temporizador_activo && {
     temporizador_activo: false,
     fecha_pausa_temporizador: new Date(),
     tiempo_empleado_segundos: await this.calcularTiempoEmpleado(peticion),
   })
   ```
7. **Registrar auditoría** con tipo `ASIGNACION`
8. **Crear notificaciones** para origen y destinos
9. **Emitir evento WebSocket** `peticionesTransferidas`

---

## 🎨 Frontend - Implementación

### **Componente: TransferirPeticionesComponent**

**Ubicación**: `Front/src/app/features/peticiones/components/transferir-peticiones/`

**Ruta**: `/peticiones/transferir`

**Permisos**: Admin, Directivo, Líder (verificado en sidebar)

### **Flujo de Uso**

1. **Seleccionar Usuario Origen**
   - Dropdown filterable con todos los usuarios activos
   - Al seleccionar → carga automática de peticiones del usuario

2. **Seleccionar Usuarios Destino**
   - MultiSelect (chip display) con usuarios disponibles
   - Excluye automáticamente al usuario origen
   - Solo muestra usuarios con `status = true`

3. **Ingresar Motivo**
   - Textarea obligatorio
   - Ejemplos: "Usuario de vacaciones", "Redistribución de carga", "Usuario reasignado"

4. **Seleccionar Peticiones**
   - Tabla con checkbox por fila y checkbox general
   - Solo muestra peticiones en estados transferibles
   - Filtro de búsqueda global
   - Paginación 10/25/50

5. **Confirmar Transferencia**
   - Resumen visual con chips
   - Diálogo de confirmación con PrimeNG
   - Loading state durante el proceso
   - Toast notifications con resultado

### **Validaciones Frontend**

```typescript
puedeTransferir(): boolean {
  return (
    !!this.usuarioOrigenSeleccionado &&
    this.peticionesSeleccionadas.length > 0 &&
    this.usuariosDestinoSeleccionados.length > 0 &&
    this.motivo.trim().length > 0
  );
}
```

### **UI Components**

**Tabla de Peticiones**:
- Columns: Checkbox | ID | Cliente | Categoría | Descripción | Área | Estado | Fecha
- Checkbox header para select all
- Estados con colores PrimeNG Tag
- Áreas con Chip e iconos

**Resumen de Transferencia**:
```html
<p-card>
  <i class="pi pi-user"></i> Origen: Juan Pérez
  <i class="pi pi-users"></i> Destino: María García, Carlos López
  <i class="pi pi-file"></i> Peticiones: 4 seleccionadas
  
  <button pButton label="Transferir" [disabled]="!puedeTransferir()">
</p-card>
```

---

## 🗂️ Navegación

### **Sidebar Menu**

Opción agregada en sección "Peticiones":
```typescript
{
  label: 'Transferir',
  icon: 'pi pi-arrow-right-arrow-left',
  routerLink: ['/peticiones/transferir'],
}
```

**Visible solo para**: Admin, Directivo, Líder

### **Routing**

```typescript
{
  path: 'transferir',
  loadComponent: () => import('./components/transferir-peticiones/...'),
  data: { 
    breadcrumb: 'Transferir Peticiones', 
    roles: ['Admin', 'Directivo', 'Líder'] 
  }
}
```

---

## 📊 Base de Datos - Cambios

### **Tabla: peticiones**

**Campos Relevantes**:
- `asignado_a`: Se actualiza con el nuevo usuario_destino_id
- `temporizador_activo`: Se pone en `false` si estaba activo
- `fecha_pausa_temporizador`: Se registra la fecha de pausa
- `tiempo_empleado_segundos`: Se actualiza con el tiempo acumulado

### **Tabla: auditoria_cambios**

**Nuevo Registro por Petición Transferida**:
```sql
INSERT INTO auditoria_cambios (
  tabla_afectada, 
  registro_id, 
  tipo_cambio, 
  campo_modificado, 
  valor_anterior, 
  valor_nuevo, 
  usuario_id, 
  descripcion
) VALUES (
  'peticiones', 
  12, 
  'ASIGNACION', 
  'asignado_a', 
  '5', 
  '8', 
  1, 
  'Transferencia de petición: Usuario de vacaciones'
);
```

### **Tabla: notificaciones**

**Notificaciones Creadas**:

1. **Por cada usuario destino** (una por petición asignada):
```sql
INSERT INTO notificaciones (
  usuario_id, 
  tipo, 
  titulo, 
  mensaje, 
  peticion_id
) VALUES (
  8, 
  'asignacion', 
  'Petición transferida', 
  'Se te ha asignado la petición #12 del cliente Tech Solutions', 
  12
);
```

2. **Usuario origen** (resumen):
```sql
INSERT INTO notificaciones (
  usuario_id, 
  tipo, 
  titulo, 
  mensaje
) VALUES (
  5, 
  'sistema', 
  'Peticiones transferidas', 
  'Se han transferido 4 peticiones a otros usuarios. Motivo: Usuario de vacaciones'
);
```

---

## 🔔 WebSocket - Eventos

### **Evento Emitido: `peticionesTransferidas`**

```typescript
webSocketService.emit("peticionesTransferidas", {
  usuario_origen_id: 5,
  usuarios_destino_ids: [8, 10],
  cantidad: 4,
  motivo: "Usuario de vacaciones"
});
```

**Uso**: Actualizar dashboards en tiempo real cuando ocurre una transferencia

---

## 🧪 Casos de Prueba

### **Caso 1: Transferencia Simple (1 usuario destino)**
```json
{
  "usuario_origen_id": 5,
  "peticiones_ids": [12, 15],
  "usuarios_destino_ids": [8],
  "motivo": "Redistribución"
}
```
**Resultado**: 
- Usuario 8 recibe 2 peticiones

### **Caso 2: Transferencia Múltiple (3 usuarios destino)**
```json
{
  "usuario_origen_id": 5,
  "peticiones_ids": [12, 15, 18, 22, 25, 28, 30],
  "usuarios_destino_ids": [8, 10, 12],
  "motivo": "Usuario se va de la empresa"
}
```
**Resultado Round-Robin**:
- Usuario 8: peticiones 12, 22, 28 (3)
- Usuario 10: peticiones 15, 25, 30 (3)
- Usuario 12: petición 18 (1)

### **Caso 3: Petición con Temporizador Activo**
**Estado Inicial**:
```json
{
  "id": 12,
  "asignado_a": 5,
  "temporizador_activo": true,
  "fecha_inicio_temporizador": "2025-10-22T10:00:00Z",
  "tiempo_empleado_segundos": 3600
}
```

**Después de Transferencia**:
```json
{
  "id": 12,
  "asignado_a": 8,
  "temporizador_activo": false,
  "fecha_pausa_temporizador": "2025-10-22T12:00:00Z",
  "tiempo_empleado_segundos": 10800
}
```
*Se sumaron 2 horas (7200 seg) al tiempo empleado*

---

## 🛠️ Troubleshooting

### **Error: "No hay peticiones válidas para transferir"**
**Causas**:
- Peticiones ya están resueltas/canceladas
- Peticiones no pertenecen al usuario origen
- IDs de peticiones no existen

**Solución**: Verificar estado de peticiones con:
```sql
SELECT id, estado, asignado_a 
FROM peticiones 
WHERE id IN (12, 15, 18);
```

### **Error: "Uno o más usuarios destino no existen o están inactivos"**
**Causas**:
- Usuario destino tiene `status = false`
- ID de usuario no existe

**Solución**: Verificar usuarios con:
```sql
SELECT uid, nombre_completo, status 
FROM usuarios 
WHERE uid IN (8, 10, 12);
```

### **Frontend: Botón "Transferir" deshabilitado**
**Verificar**:
1. Usuario origen seleccionado
2. Al menos 1 petición seleccionada
3. Al menos 1 usuario destino seleccionado
4. Motivo con texto (no vacío)

---

## 📝 Changelog

### **v1.0.0 - 2025-10-22**

**Backend**:
- ✅ Endpoint POST `/api/peticiones/transferir`
- ✅ Servicio `transferirPeticiones()` con distribución round-robin
- ✅ Validaciones de permisos (Admin, Directivo, Líder)
- ✅ Pausa automática de temporizadores activos
- ✅ Auditoría completa de cambios
- ✅ Notificaciones automáticas
- ✅ Evento WebSocket `peticionesTransferidas`

**Frontend**:
- ✅ Componente `TransferirPeticionesComponent` standalone
- ✅ UI con PrimeNG: Dropdown, MultiSelect, Table, Chips
- ✅ Validaciones en tiempo real
- ✅ Confirmación con diálogo
- ✅ Toast notifications con distribución
- ✅ Ruta `/peticiones/transferir`
- ✅ Opción en sidebar (solo roles permitidos)

**Seguridad**:
- ✅ Middleware `roleAuth` en backend
- ✅ Verificación de permisos en servicio
- ✅ Validación de propiedad de peticiones
- ✅ Check de usuarios activos

---

## 🚀 Uso Recomendado

### **Escenarios de Uso**

1. **Vacaciones**: 
   - Transferir todas las peticiones de un usuario a su equipo
   - Motivo: "Vacaciones del 25/10 al 08/11"

2. **Salida de Empleado**: 
   - Transferir todo el trabajo pendiente
   - Motivo: "Usuario se retira de la empresa"

3. **Redistribución de Carga**: 
   - Balancear peticiones entre varios usuarios
   - Motivo: "Balanceo de carga de trabajo"

4. **Cambio de Área**: 
   - Reasignar peticiones cuando un usuario cambia de rol
   - Motivo: "Usuario cambia a área de Gestión"

---

## 🎓 Notas Técnicas

### **Performance**
- Transacciones atómicas: Si falla una actualización, se revierte todo
- Consultas optimizadas con `Op.in` de Sequelize
- Carga lazy de componente (code splitting)

### **Seguridad**
- NUNCA confiar en datos del frontend
- Validar siempre en backend
- Registrar TODOS los cambios en auditoría

### **UX**
- Feedback inmediato con loading states
- Mensajes claros de error
- Resumen visual antes de confirmar
- Toast con distribución detallada

---

**Autor**: Sistema de Gestión de Peticiones  
**Fecha**: 22 de Octubre, 2025  
**Versión**: 1.0.0
