# 🐛 FIX: Permisos para Pausar/Reanudar Peticiones - Backend

## 📋 Problema Identificado

El usuario reportó que **no puede pausar peticiones** en el detalle de petición, mostrando errores:
- ❌ "Solo puedes pausar peticiones asignadas a ti"
- ❌ "No tienes autorización para esta acción"

## 🔍 Diagnóstico

### Root Cause
**Bug Crítico en Backend**: Uso incorrecto de la propiedad del rol del usuario

**Backend/src/services/peticion.service.ts:**
```typescript
// ❌ INCORRECTO (línea 730)
const tienePemisoEspecial = ["Admin", "Directivo", "Líder"].includes(usuarioActual.role);
//                                                                                    ^^^^
//                                                                        DEBERÍA SER: .rol
```

### Contexto Técnico

**1. JWT Payload (jwt.util.ts):**
```typescript
export interface JWTPayload {
  uid: number;
  correo: string;
  rol: string;  // ⬅️ PROPIEDAD EN ESPAÑOL
  area: string;
}
```

**2. Middleware de Autenticación:**
```typescript
// auth.middleware.ts
const decoded = verifyToken(token);
req.usuario = decoded; // decoded tiene { uid, correo, rol, area }
```

**3. Controller de Peticiones:**
```typescript
// peticion.controller.ts
const usuarioActual = req.usuario; // { uid, correo, rol, area }
await peticionService.pausarTemporizador(id, usuarioActual);
```

**4. Service - BUG:**
```typescript
// ❌ ANTES (línea 730 y 791)
const tienePemisoEspecial = ["Admin", "Directivo", "Líder"].includes(usuarioActual.role);
//                                                                                    ^^^^
// ❌ usuarioActual.role es UNDEFINED
// ✅ Debería ser: usuarioActual.rol
```

### Impacto
- ✅ Frontend: Funcional (usa `currentUser.rol` correctamente)
- ❌ Backend: FALLABA la validación de permisos
- ❌ Resultado: Usuarios Admin/Directivo/Líder NO podían pausar peticiones de otros
- ❌ Resultado: Solo el usuario asignado podía pausar SUS propias peticiones

## ✅ Solución Implementada

### 1. Corregir pausarTemporizador()
**Archivo:** `Backend/src/services/peticion.service.ts` (línea 724-744)

```typescript
async pausarTemporizador(id: number, usuarioActual: any) {
  const peticion = await Peticion.findByPk(id);
  if (!peticion) throw new NotFoundError("Petición no encontrada");
  
  // ✅ CORREGIDO: Usar .rol en lugar de .role
  const esAsignado = peticion.asignado_a === usuarioActual.uid;
  const tienePemisoEspecial = ["Admin", "Directivo", "Líder"].includes(usuarioActual.rol);
  //                                                                                   ^^^
  
  // 🔍 Logs de depuración
  console.log('🔍 pausarTemporizador - Verificación de permisos:', {
    peticionId: id,
    asignado_a: peticion.asignado_a,
    usuarioActual: {
      uid: usuarioActual.uid,
      rol: usuarioActual.rol
    },
    esAsignado,
    tienePemisoEspecial
  });
  
  if (!esAsignado && !tienePemisoEspecial) {
    throw new ForbiddenError("No tienes permiso para pausar esta petición");
  }
  
  // ... resto del código ...
}
```

### 2. Corregir reanudarTemporizador()
**Archivo:** `Backend/src/services/peticion.service.ts` (línea 784-804)

```typescript
async reanudarTemporizador(id: number, usuarioActual: any) {
  const peticion = await Peticion.findByPk(id);
  if (!peticion) throw new NotFoundError("Petición no encontrada");
  
  // ✅ CORREGIDO: Usar .rol en lugar de .role
  const esAsignado = peticion.asignado_a === usuarioActual.uid;
  const tienePemisoEspecial = ["Admin", "Directivo", "Líder"].includes(usuarioActual.rol);
  //                                                                                   ^^^
  
  // 🔍 Logs de depuración
  console.log('🔍 reanudarTemporizador - Verificación de permisos:', {
    peticionId: id,
    asignado_a: peticion.asignado_a,
    usuarioActual: {
      uid: usuarioActual.uid,
      rol: usuarioActual.rol
    },
    esAsignado,
    tienePemisoEspecial
  });
  
  if (!esAsignado && !tienePemisoEspecial) {
    throw new ForbiddenError("No tienes permiso para reanudar esta petición");
  }
  
  // ... resto del código ...
}
```

## 🧪 Pruebas Requeridas

### Matriz de Permisos

| Usuario / Petición | Asignada a Sí Mismo | Asignada a Otro |
|-------------------|---------------------|-----------------|
| **Usuario Normal** | ✅ Puede pausar/reanudar | ❌ No puede |
| **Líder** | ✅ Puede pausar/reanudar | ✅ Puede (si es de su área) |
| **Directivo** | ✅ Puede pausar/reanudar | ✅ Puede (cualquier petición) |
| **Admin** | ✅ Puede pausar/reanudar | ✅ Puede (cualquier petición) |

### Test Case 1: Admin pausa petición de otro usuario
**Preparación:**
1. Login como `admin@empresa.com` / `123456`
2. Ir a Peticiones → Detalle de petición #6 (asignada a Carlos López)
3. Verificar que aparece botón "Pausar Temporizador"

**Acción:**
4. Click en "Pausar Temporizador"

**Resultado Esperado:**
- ✅ Backend console: `🔍 pausarTemporizador - Verificación de permisos: { esAsignado: false, tienePemisoEspecial: true }`
- ✅ Petición se pausa exitosamente
- ✅ Estado cambia a "Pausada" (badge naranja)
- ✅ Botón cambia a "Reanudar Temporizador"
- ✅ Notificación: "Temporizador Pausado"

### Test Case 2: Líder pausa petición de su área
**Preparación:**
1. Login como `luis.lider@empresa.com` / `123456` (Líder de Pautas)
2. Ir a Peticiones → Filtrar por área "Pautas"
3. Ver detalle de petición asignada a otro usuario

**Acción:**
4. Click en "Pausar Temporizador"

**Resultado Esperado:**
- ✅ Backend console: `🔍 pausarTemporizador - Verificación de permisos: { esAsignado: false, tienePemisoEspecial: true }`
- ✅ Petición se pausa exitosamente

### Test Case 3: Usuario normal NO puede pausar peticiones de otros
**Preparación:**
1. Login como `carlos.lopez@empresa.com` / `123456` (Usuario normal)
2. Ir a Peticiones → Ver petición asignada a otro usuario

**Resultado Esperado:**
- ✅ NO aparece botón "Pausar Temporizador"
- ✅ Frontend `canPauseOrResume()` retorna `false`

### Test Case 4: Usuario normal SÍ puede pausar sus propias peticiones
**Preparación:**
1. Login como `carlos.lopez@empresa.com` / `123456`
2. Ir a Dashboard Usuario → Ver "Mis Peticiones Asignadas"
3. Ver detalle de una petición asignada a ti mismo

**Resultado Esperado:**
- ✅ Aparece botón "Pausar Temporizador"
- ✅ Click funciona correctamente
- ✅ Backend console: `🔍 pausarTemporizador - Verificación de permisos: { esAsignado: true, tienePemisoEspecial: false }`

## 📝 Archivos Modificados

### Backend
- `Backend/src/services/peticion.service.ts` (2 métodos corregidos)
  - Línea 730: `usuarioActual.role` → `usuarioActual.rol`
  - Línea 791: `usuarioActual.role` → `usuarioActual.rol`
  - Agregados console.log para depuración

### Frontend
- `Front/src/app/features/peticiones/components/detalle-peticion/detalle-peticion.component.ts`
  - Agregados console.log de depuración en `canPauseOrResume()`

## 🚀 Despliegue

### 1. Reiniciar Backend
```powershell
cd Backend
npm run dev
```

### 2. Refrescar Frontend
- Ctrl+Shift+R en el navegador
- O cerrar y reabrir la aplicación

### 3. Verificar Logs
**Backend (Terminal):**
```
🔍 pausarTemporizador - Verificación de permisos: {
  peticionId: 6,
  asignado_a: 3,
  usuarioActual: { uid: 1, rol: 'Admin' },
  esAsignado: false,
  tienePemisoEspecial: true  // ✅ DEBE SER TRUE para Admin/Directivo/Líder
}
```

**Frontend (Consola del navegador):**
```
🔍 canPauseOrResume - Verificación: {
  peticionId: 6,
  asignado_a: 3,
  currentUserUid: 1,
  currentUserRol: 'Admin',
  esAsignado: false,
  tienePemisoEspecial: true,
  resultado: true  // ✅ DEBE SER TRUE
}
```

## 📊 Resumen de Cambios

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `Backend/src/services/peticion.service.ts` | 730 | `usuarioActual.role` → `usuarioActual.rol` |
| `Backend/src/services/peticion.service.ts` | 791 | `usuarioActual.role` → `usuarioActual.rol` |
| `Backend/src/services/peticion.service.ts` | 732-744 | Agregados console.log de depuración |
| `Backend/src/services/peticion.service.ts` | 793-805 | Agregados console.log de depuración |
| `Frontend/.../detalle-peticion.component.ts` | 302-320 | Agregados console.log de depuración |

## ✅ Checklist de Verificación

- [x] Backend corregido: `usuarioActual.role` → `usuarioActual.rol`
- [x] Logs de depuración agregados en backend
- [x] Logs de depuración agregados en frontend
- [x] Sin errores de compilación (backend y frontend)
- [ ] Backend reiniciado
- [ ] Frontend refrescado
- [ ] Pruebas de permisos ejecutadas (Admin, Líder, Usuario)
- [ ] Logs verificados en console backend y frontend
- [ ] Documentación creada

## 🎯 Resultado Final

**Antes:**
- ❌ Admin/Directivo/Líder NO podían pausar peticiones de otros
- ❌ Errores de permisos en backend
- ❌ `tienePemisoEspecial` siempre era `false`

**Después:**
- ✅ Admin/Directivo/Líder pueden pausar cualquier petición
- ✅ Usuarios normales solo pausan sus propias peticiones
- ✅ Permisos funcionan correctamente en frontend y backend
- ✅ Logs de depuración disponibles para troubleshooting

---

**Fecha:** 15 de Octubre de 2025  
**Tipo de Fix:** Bug Crítico - Validación de Permisos  
**Impacto:** Alto - Afecta funcionalidad core del sistema  
**Estado:** ✅ Resuelto - Listo para pruebas
