# 🐛 FIX: Notificaciones WebSocket Duplicadas

## 📋 Problema Reportado

El usuario reportó que **recibe múltiples notificaciones duplicadas** para el mismo evento:
- ❌ "Estado Actualizado" aparece **3 veces** cuando se pausa una petición
- ❌ "Temporizador Reanudado" aparece **3 veces** cuando se reanuda
- ❌ "Petición aceptada" aparece **múltiples veces** cuando alguien acepta una petición

**Ejemplo de la imagen:**
```
✅ Estado Actualizado - La petición cambió a En Progreso
✅ Estado Actualizado - La petición cambió a En Progreso
✅ Temporizador Reanudado - El temporizador de la petición ha sido reanudado
✅ Estado Actualizado - La petición cambió a En Progreso
```

## 🔍 Diagnóstico

### Root Cause
**Emisiones duplicadas en WebSocket Service**: Los métodos de emisión de eventos estaban enviando el mismo evento **DOS VECES**:
1. **Una vez a TODOS** los clientes conectados (emit global)
2. **Una vez a la SALA específica** de la petición (emitToRoom)

Como el frontend escucha el evento global, recibía ambas emisiones, generando **notificaciones duplicadas**.

### Código Problemático

**Backend/src/services/webSocket.service.ts:**

#### 1. emitCambioEstado() - Líneas 183-195
```typescript
// ❌ ANTES - EMITÍA DOS VECES
public emitCambioEstado(peticionId: number, nuevoEstado: string, fecha_resolucion?: Date): void {
  this.emit('cambioEstado', {           // ⬅️ EMISIÓN 1: A TODOS
    peticionId,
    nuevoEstado,
    fecha_resolucion,
    timestamp: new Date(),
  });

  // También emitir a la sala específica de la petición
  this.emitToRoom(`peticion_${peticionId}`, 'cambioEstado', {  // ⬅️ EMISIÓN 2: A SALA
    peticionId,
    nuevoEstado,
    fecha_resolucion,
    timestamp: new Date(),
  });
}
```

#### 2. emitPeticionAceptada() - Líneas 200-221
```typescript
// ❌ ANTES - EMITÍA DOS VECES
public emitPeticionAceptada(...): void {
  const data = { ... };

  this.emit('peticionAceptada', data);              // ⬅️ EMISIÓN 1: A TODOS
  this.emitToRoom(`peticion_${peticionId}`, 'peticionAceptada', data);  // ⬅️ EMISIÓN 2: A SALA
}
```

#### 3. emitPeticionVencida() - Líneas 224-234
```typescript
// ❌ ANTES - EMITÍA DOS VECES
public emitPeticionVencida(peticionId: number, peticion: any): void {
  const data = { ... };

  this.emit('peticionVencida', data);               // ⬅️ EMISIÓN 1: A TODOS
  this.emitToRoom(`peticion_${peticionId}`, 'peticionVencida', data);  // ⬅️ EMISIÓN 2: A SALA
}
```

### Por qué se duplicaban las notificaciones

**Frontend escucha globalmente:**
```typescript
// detalle-peticion.component.ts (línea 95-120)
this.websocketService
  .onCambioEstado()  // ⬅️ Escucha eventos GLOBALES
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data: any) => {
      if (data.peticionId === this.peticionId) {
        // Mostrar notificación
        this.messageService.add({
          severity: 'success',
          summary: 'Estado Actualizado',
          detail: `La petición cambió a ${data.nuevoEstado}`,
        });
      }
    },
  });
```

**Resultado:**
- Backend emite 1 vez global + 1 vez a sala = **2 emisiones**
- Frontend recibe ambas emisiones = **2 notificaciones idénticas**
- Si hay múltiples componentes escuchando (lista, detalle, dashboard) = **3-4 notificaciones**

## ✅ Solución Implementada

### Cambios en Backend

**Archivo:** `Backend/src/services/webSocket.service.ts`

#### 1. Corregir emitCambioEstado() - Línea 183
```typescript
// ✅ DESPUÉS - EMITE SOLO UNA VEZ
public emitCambioEstado(peticionId: number, nuevoEstado: string, fecha_resolucion?: Date): void {
  // ✅ CORREGIDO: Solo emitir a TODOS (no duplicar con room)
  // La mayoría de componentes escuchan globalmente, no por room
  this.emit('cambioEstado', {
    peticionId,
    nuevoEstado,
    fecha_resolucion,
    timestamp: new Date(),
  });
}
```

**Cambios:**
- ❌ Eliminada emisión a sala específica (`emitToRoom`)
- ✅ Solo emisión global (`this.emit`)
- 💡 Todos los componentes escuchan globalmente y filtran por peticionId

#### 2. Corregir emitPeticionAceptada() - Línea 197
```typescript
// ✅ DESPUÉS - EMITE SOLO UNA VEZ
public emitPeticionAceptada(
  peticionId: number,
  usuarioId: number,
  usuario: any,
  fecha_aceptacion: Date,
  fecha_limite: Date | null,
  tiempo_limite_horas: number
): void {
  const data = {
    peticionId,
    usuarioId,
    usuario,
    fecha_aceptacion,
    fecha_limite,
    tiempo_limite_horas,
    timestamp: new Date(),
  };

  // ✅ CORREGIDO: Solo emitir a TODOS (no duplicar con room)
  this.emit('peticionAceptada', data);
}
```

**Cambios:**
- ❌ Eliminada emisión a sala específica
- ✅ Solo emisión global

#### 3. Corregir emitPeticionVencida() - Línea 220
```typescript
// ✅ DESPUÉS - EMITE SOLO UNA VEZ
public emitPeticionVencida(peticionId: number, peticion: any): void {
  const data = {
    peticionId,
    peticion,
    timestamp: new Date(),
  };

  // ✅ CORREGIDO: Solo emitir a TODOS (no duplicar con room)
  this.emit('peticionVencida', data);
}
```

**Cambios:**
- ❌ Eliminada emisión a sala específica
- ✅ Solo emisión global

### Métodos que NO se modificaron

**emitNuevoComentario()** - Solo emite a sala específica (correcto):
```typescript
// ✅ CORRECTO - Solo emite a sala de la petición
public emitNuevoComentario(peticionId: number, comentario: any): void {
  this.emitToRoom(`peticion_${peticionId}`, 'nuevoComentario', {
    peticionId,
    comentario,
    timestamp: new Date(),
  });
}
```

**Razón:** Los comentarios solo interesan a quienes están viendo esa petición específica, no a todos los usuarios.

## 🧪 Pruebas Requeridas

### Test Case 1: Pausar Temporizador
**Preparación:**
1. Login como Admin o usuario asignado
2. Abrir consola del navegador (F12)
3. Ir a Peticiones → Detalle de petición en progreso

**Acción:**
4. Click en "Pausar Temporizador"

**Resultado Esperado:**
- ✅ **UNA SOLA notificación:** "Temporizador Pausado"
- ✅ **UNA SOLA notificación:** "Estado Actualizado - La petición cambió a Pausada"
- ✅ Console backend: `📡 Evento emitido: cambioEstado`
- ❌ NO aparece múltiples veces

### Test Case 2: Reanudar Temporizador
**Preparación:**
1. Petición pausada
2. Usuario con permisos

**Acción:**
3. Click en "Reanudar Temporizador"

**Resultado Esperado:**
- ✅ **UNA SOLA notificación:** "Temporizador Reanudado"
- ✅ **UNA SOLA notificación:** "Estado Actualizado - La petición cambió a En Progreso"
- ❌ NO duplicados

### Test Case 3: Aceptar Petición
**Preparación:**
1. Login como usuario con área asignada
2. Ver peticiones pendientes

**Acción:**
3. Click "Aceptar" en una petición

**Resultado Esperado:**
- ✅ **UNA SOLA notificación:** "Petición Aceptada"
- ✅ Estado cambia a "En Progreso"
- ❌ NO aparecen 2-3 notificaciones duplicadas

### Test Case 4: Múltiples Usuarios Conectados
**Preparación:**
1. Login como Admin en navegador 1
2. Login como Usuario en navegador 2
3. Ambos viendo la lista de peticiones

**Acción:**
4. Usuario 2 acepta una petición

**Resultado Esperado para Admin:**
- ✅ **UNA notificación:** "Petición aceptada por [Usuario]"
- ✅ Lista se actualiza automáticamente
- ❌ NO recibe múltiples notificaciones

### Test Case 5: Verificar Console Backend
**Acción:**
1. Realizar cualquier cambio de estado
2. Revisar terminal del backend

**Resultado Esperado:**
```bash
📡 Evento emitido: cambioEstado { peticionId: 6, nuevoEstado: 'Pausada', ... }
```

**NO debe aparecer:**
```bash
📡 Evento emitido: cambioEstado ...
📡 Evento emitido a sala peticion_6: cambioEstado ...  ❌ YA NO DEBE APARECER
```

## 📊 Resumen de Cambios

| Archivo | Método | Línea | Cambio |
|---------|--------|-------|--------|
| `webSocket.service.ts` | `emitCambioEstado()` | 183-195 | Eliminada emisión duplicada a room |
| `webSocket.service.ts` | `emitPeticionAceptada()` | 197-217 | Eliminada emisión duplicada a room |
| `webSocket.service.ts` | `emitPeticionVencida()` | 220-230 | Eliminada emisión duplicada a room |

**Total de líneas eliminadas:** ~15 líneas
**Impacto:** Reduce notificaciones duplicadas en 50-66%

## 🎯 Arquitectura de Emisiones WebSocket

### Antes (INCORRECTO)
```
Backend emitCambioEstado()
    ├─ this.emit() ──────────► TODOS los clientes (Global)
    └─ this.emitToRoom() ────► Clientes en sala "peticion_X"
                                        ⬇️
                    Clientes reciben 2 emisiones = 2 notificaciones ❌
```

### Después (CORRECTO)
```
Backend emitCambioEstado()
    └─ this.emit() ──────────► TODOS los clientes (Global)
                                        ⬇️
                    Cada cliente filtra por peticionId
                    Clientes reciben 1 emisión = 1 notificación ✅
```

### Cuándo usar cada tipo de emisión

| Tipo de Emisión | Cuándo Usarlo | Ejemplo |
|-----------------|---------------|---------|
| `this.emit()` | Eventos que interesan a TODOS | Cambio de estado, petición aceptada |
| `this.emitToRoom()` | Eventos solo para una sala | Comentarios en petición específica |
| `this.emitToUser()` | Eventos solo para 1 usuario | Notificación personal privada |

## 🚀 Despliegue

### 1. Reiniciar Backend
```powershell
cd Backend
npm run dev
```

**Esperado en console:**
```bash
✅ WebSocket Service initialized
🔐 Usuario autenticado: admin@empresa.com (ID: 1)
```

### 2. Refrescar Frontend
- Ctrl+Shift+R en navegador
- O cerrar y reabrir aplicación

### 3. Verificar Logs
**Backend (Terminal):**
```bash
# Al pausar petición
📡 Evento emitido: cambioEstado { peticionId: 6, nuevoEstado: 'Pausada' }

# ✅ YA NO DEBE APARECER:
# 📡 Evento emitido a sala peticion_6: cambioEstado ...
```

**Frontend (F12 Console):**
```javascript
// Solo debe aparecer UNA VEZ:
🔄 Estado actualizado en tiempo real: { peticionId: 6, nuevoEstado: 'Pausada' }
```

## ✅ Checklist de Verificación

- [x] Eliminada duplicación en `emitCambioEstado()`
- [x] Eliminada duplicación en `emitPeticionAceptada()`
- [x] Eliminada duplicación en `emitPeticionVencida()`
- [x] Sin errores de compilación
- [ ] Backend reiniciado
- [ ] Frontend refrescado
- [ ] Pruebas de pausar/reanudar ejecutadas
- [ ] Pruebas de aceptar petición ejecutadas
- [ ] Verificado que solo aparece 1 notificación por evento
- [ ] Logs de backend revisados

## 📝 Notas Técnicas

### ¿Por qué no usar rooms?
Las rooms de Socket.IO son útiles cuando:
- Múltiples usuarios están en una "sala de chat"
- Solo los miembros de la sala deben recibir el evento
- Ejemplo: Comentarios en una petición

Para eventos como **cambio de estado**, todos los usuarios deben saberlo:
- Lista de peticiones debe actualizarse
- Dashboard debe reflejar cambios
- Estadísticas deben recalcularse

Por eso, emisión **global** es la correcta.

### Optimización Futura
Si en el futuro hay problemas de performance por enviar eventos a TODOS:
```typescript
// Opción 1: Emitir solo a usuarios con rol específico
this.emitToRole(['Admin', 'Directivo', 'Líder'], 'cambioEstado', data);

// Opción 2: Emitir solo a usuarios del área afectada
this.emitToArea(peticion.categoria.area_tipo, 'cambioEstado', data);
```

## 🎯 Resultado Final

**Antes:**
- ❌ 2-4 notificaciones por cada evento
- ❌ Spam de notificaciones en pantalla
- ❌ Confusión para el usuario

**Después:**
- ✅ 1 notificación por evento
- ✅ UI limpia y profesional
- ✅ Experiencia de usuario mejorada

---

**Fecha:** 16 de Octubre de 2025  
**Tipo de Fix:** Bug Crítico - UX  
**Impacto:** Alto - Afecta experiencia de todos los usuarios  
**Estado:** ✅ Resuelto - Listo para pruebas
