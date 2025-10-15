# Solución: Error de Dependencia Circular y Problemas de Navegación

## 🐛 Problemas Identificados

### 1. Error NG0200: Dependencia Circular en NotificacionService
**Error en consola:**
```
RuntimeErrors NG0200: Circular dependency in DI detected for _NotificacionService
```

**Causa:** El servicio `NotificacionService` se inyectaba usando `inject()` directamente en el constructor, causando una dependencia circular al ser inyectado en el `authGuard`.

### 2. Problema de Navegación
**Síntoma:** Los usuarios con roles diferentes a Admin no pueden navegar a ninguna sección (Peticiones, Clientes, Usuarios, etc.).

**Causa:** El error de dependencia circular bloqueaba la inicialización correcta de los guards y servicios, impidiendo la navegación.

---

## ✅ Soluciones Aplicadas

### 1. Corrección del NotificacionService

#### Problema Original:
```typescript
// ❌ ANTES - Causaba dependencia circular
import { Injectable, inject } from '@angular/core';

export class NotificacionService {
  private notificacionApiService = inject(NotificacionApiService);
  private websocketService = inject(WebsocketService);
  private messageService = inject(MessageService);

  constructor() {
    this.initializeWebSocketListeners();
    this.loadNotificaciones();
  }
}
```

#### Solución Implementada:
```typescript
// ✅ DESPUÉS - Lazy initialization con Injector
import { Injectable, Injector } from '@angular/core';

export class NotificacionService {
  private notificacionApiService!: NotificacionApiService;
  private websocketService!: WebsocketService;
  private messageService!: MessageService;

  constructor(private injector: Injector) {
    // Lazy initialization para evitar dependencias circulares
    setTimeout(() => {
      this.notificacionApiService = this.injector.get(NotificacionApiService);
      this.websocketService = this.injector.get(WebsocketService);
      this.messageService = this.injector.get(MessageService);
      
      this.initializeWebSocketListeners();
      this.loadNotificaciones();
    });
  }
}
```

**Ventajas de esta solución:**
- ✅ Evita la dependencia circular
- ✅ Los servicios se inicializan de forma asíncrona
- ✅ No bloquea el proceso de navegación

---

### 2. Validaciones de Seguridad en Todos los Métodos

Para evitar errores cuando los servicios aún no están inicializados, se agregaron validaciones en todos los métodos que los usan:

#### Métodos de Notificaciones Toast
```typescript
success(mensaje: string, titulo: string = 'Exito'): void {
  if (!this.messageService) return; // ✅ Validación agregada
  this.messageService.add({
    severity: 'success',
    summary: titulo,
    detail: mensaje,
    life: 3000
  });
}

error(mensaje: string, titulo: string = 'Error'): void {
  if (!this.messageService) return; // ✅ Validación agregada
  // ...
}

warning(mensaje: string, titulo: string = 'Advertencia'): void {
  if (!this.messageService) return; // ✅ Validación agregada
  // ...
}

info(mensaje: string, titulo: string = 'Informacion'): void {
  if (!this.messageService) return; // ✅ Validación agregada
  // ...
}
```

#### Métodos de API
```typescript
loadNotificaciones(): void {
  if (!this.notificacionApiService) return; // ✅ Validación agregada
  this.notificacionApiService.getAll({ limit: 50 }).subscribe({
    // ...
  });
}

loadUnreadCount(): void {
  if (!this.notificacionApiService) return; // ✅ Validación agregada
  // ...
}

markAsRead(id: number): void {
  if (!this.notificacionApiService) return; // ✅ Validación agregada
  // ...
}

markAllAsRead(): void {
  if (!this.notificacionApiService) return; // ✅ Validación agregada
  // ...
}

delete(id: number): void {
  if (!this.notificacionApiService) return; // ✅ Validación agregada
  // ...
}

clear(): void {
  if (!this.notificacionApiService) return; // ✅ Validación agregada
  // ...
}
```

#### Métodos de WebSocket
```typescript
private initializeWebSocketListeners(): void {
  if (!this.websocketService) return; // ✅ Validación agregada
  
  this.websocketService.onNuevaNotificacion().subscribe((data) => {
    // ...
  });

  this.websocketService.onContadorNotificaciones().subscribe((count) => {
    // ...
  });
}

private showToastFromNotificacion(notificacion: Notificacion): void {
  if (!this.messageService) return; // ✅ Validación agregada
  
  const severityMap = { /* ... */ };
  this.messageService.add({
    // ...
  });
}
```

---

## 📋 Archivo Modificado

**Archivo:** `Front/src/app/core/services/notificacion.service.ts`

**Cambios aplicados:**
1. ✅ Cambiado de `inject()` a `Injector` con lazy initialization
2. ✅ Agregadas validaciones `if (!service) return;` en 12 métodos
3. ✅ Envuelto inicialización en `setTimeout()` para ejecución asíncrona

---

## 🎯 Resultado Esperado

### Antes (❌ Problemas)
- Error NG0200 en consola del navegador
- Usuarios no-Admin no pueden navegar
- Rutas bloqueadas
- Guards no funcionan correctamente

### Después (✅ Solucionado)
- ✅ Sin errores de dependencia circular
- ✅ Navegación funciona para todos los roles
- ✅ Guards funcionan correctamente
- ✅ NotificacionService se inicializa sin bloquear la app
- ✅ Sidebar funciona correctamente

---

## 🧪 Pruebas Recomendadas

### 1. Verificar que no hay errores en consola
```
1. Abrir DevTools (F12)
2. Ir a Console
3. Refrescar página (Ctrl+F5)
4. NO debe aparecer error NG0200
```

### 2. Probar navegación con diferentes roles

#### Como Líder (Área Pautas)
```
✅ Debe poder:
- Ver Dashboard
- Ver/Crear/Editar Peticiones de Pautas
- Ver Clientes
- Ver Usuarios (tiene permiso como Líder)
- Ver Estadísticas de su área
```

#### Como Usuario (Pautador)
```
✅ Debe poder:
- Ver Dashboard
- Ver/Crear/Aceptar Peticiones de Pautas
- Ver Clientes
- Ver sus estadísticas
- Ver notificaciones

❌ NO debe poder:
- Ver módulo de Usuarios (sin permiso)
- Ver módulo de Facturación (sin permiso)
- Ver estadísticas globales (sin permiso)
```

#### Como Usuario (Diseñador)
```
✅ Debe poder:
- Ver Dashboard
- Ver/Crear/Aceptar Peticiones de Diseño (solo Diseño)
- Ver Clientes
- Ver sus estadísticas
- Ver notificaciones

❌ NO debe ver:
- Peticiones de Pautas (filtrado por área)
```

### 3. Verificar Sidebar
```
1. Login con usuario no-Admin
2. Clic en "Peticiones" → Debe abrir el menú desplegable
3. Clic en "Todas" → Debe navegar correctamente
4. Clic en "Clientes" → Debe abrir/navegar
5. Clic en "Estadísticas" → Debe funcionar
```

---

## 🔍 Debugging si Persisten Problemas

### Si aún no puede navegar:

1. **Verificar que el usuario tiene área asignada:**
```sql
-- En MySQL
SELECT uid, nombre_completo, correo, area_id 
FROM usuarios 
WHERE correo = 'luis.lider@empresa.com';
```

2. **Verificar localStorage:**
```javascript
// En consola del navegador
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));
```

3. **Verificar en Network tab:**
```
1. Abrir DevTools → Network
2. Intentar navegar a /peticiones
3. Verificar que NO hay error 401 o 403
4. Verificar que la respuesta incluye las peticiones
```

4. **Verificar rutas:**
```typescript
// Verificar que las rutas no tienen guards restrictivos
// app.routes.ts líneas 40-50
{
  path: 'peticiones',
  loadChildren: () =>
    import('./features/peticiones/peticiones.routes').then(
      (m) => m.PETICIONES_ROUTES
    ),
  data: { breadcrumb: 'Peticiones' },
  // ✅ NO debe tener canActivate: [roleGuard]
}
```

---

## 📝 Notas Técnicas

### ¿Por qué usamos Injector en lugar de inject()?

**inject()** es más simple pero puede causar dependencias circulares:
```typescript
// Problema: inject() se ejecuta inmediatamente durante la construcción
private service = inject(MyService); // ❌ Puede causar ciclo
```

**Injector** permite lazy loading:
```typescript
// Solución: Injector permite obtener servicios después
constructor(private injector: Injector) {
  setTimeout(() => {
    this.service = this.injector.get(MyService); // ✅ Carga después
  });
}
```

### ¿Por qué setTimeout()?

Angular ejecuta el código del constructor síncronamente. Al usar `setTimeout()`, diferimos la inicialización al siguiente tick del event loop, permitiendo que Angular complete la construcción del árbol de dependencias antes de resolver las referencias circulares.

---

## ✅ Conclusión

El problema estaba en el **NotificacionService** que causaba una dependencia circular al ser inyectado en el `authGuard`. La solución fue:

1. ✅ Usar `Injector` con lazy initialization
2. ✅ Agregar validaciones de seguridad en todos los métodos
3. ✅ Usar `setTimeout()` para inicialización asíncrona

Esto permite que:
- ✅ Los guards funcionen correctamente
- ✅ La navegación esté disponible para todos los roles
- ✅ El sistema de notificaciones se inicialice sin bloquear la app
