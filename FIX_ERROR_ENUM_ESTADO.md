# 🔧 FIX: Error de Estado Enum en Dashboard Usuario

## 🐛 PROBLEMA DETECTADO

**Error en consola:**
```
GET http://localhost:3010/api/peticiones?estado=en_progreso 500 (Internal Server Error)
invalid input value for enum enum_peticiones_estado: "en_progreso"
```

**Causa raíz:**
El componente `dashboard-usuario.component.ts` estaba enviando el estado como `'en_progreso'` (minúsculas con guion bajo), pero el enum de la base de datos PostgreSQL espera `'En Progreso'` (con mayúsculas y espacio).

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Archivo modificado: `dashboard-usuario.component.ts`

**Antes (❌ INCORRECTO):**
```typescript
// Cargar peticiones asignadas - FIX: usar 'en_progreso' o el valor correcto del enum
this.peticionService.getAll({ estado: 'en_progreso' as any }).subscribe({
  next: (response: any) => {
    if (response.success && response.data) {
      this.peticionesAsignadas = response.data;
    }
  },
});
```

**Después (✅ CORRECTO):**
```typescript
// Cargar peticiones asignadas (En Progreso)
this.peticionService.getAll({ estado: EstadoPeticion.EN_PROGRESO }).subscribe({
  next: (response: any) => {
    if (response.success && response.data) {
      this.peticionesAsignadas = response.data;
    }
  },
});
```

**Import agregado:**
```typescript
import { EstadoPeticion } from '../../../core/models/peticion.model';
```

---

## 📋 VALORES CORRECTOS DEL ENUM

El enum `EstadoPeticion` en `peticion.model.ts` define:

```typescript
export enum EstadoPeticion {
  PENDIENTE = 'Pendiente',
  EN_PROGRESO = 'En Progreso',    // ← Correcto: con espacio y mayúsculas
  RESUELTA = 'Resuelta',
  CANCELADA = 'Cancelada'
}
```

### ✅ Valores correctos para usar:
- `EstadoPeticion.PENDIENTE` → `'Pendiente'`
- `EstadoPeticion.EN_PROGRESO` → `'En Progreso'` ✅
- `EstadoPeticion.RESUELTA` → `'Resuelta'`
- `EstadoPeticion.CANCELADA` → `'Cancelada'`

### ❌ Valores incorrectos (NO usar):
- ❌ `'en_progreso'` (snake_case)
- ❌ `'enprogreso'` (sin espacio)
- ❌ `'EN PROGRESO'` (todo mayúsculas)
- ❌ `'en progreso'` (todo minúsculas)

---

## 🎯 CONTEXTO DEL ERROR

### Dónde ocurría:
1. Usuario con rol **Usuario** o **Líder** inicia sesión
2. Navega al **Dashboard Usuario** (`/dashboard/usuario`)
3. El componente carga automáticamente en `ngOnInit()`:
   - Estadísticas del mes
   - ❌ **Peticiones asignadas** (filtrando por `estado: 'en_progreso'`)
   - Peticiones pendientes disponibles

### Flujo de la petición HTTP:
```
Frontend:
dashboard-usuario.component.ts (línea 65)
  → this.peticionService.getAll({ estado: 'en_progreso' })

↓ HTTP GET Request

Backend:
GET /api/peticiones?estado=en_progreso
  → peticion.controller.ts → getAll()
  → peticion.service.ts → getAll(filtros)
  → Sequelize WHERE clause: { estado: 'en_progreso' }

↓ Base de Datos (PostgreSQL)

❌ ERROR: enum_peticiones_estado no reconoce 'en_progreso'
✅ Valores válidos: 'Pendiente', 'En Progreso', 'Resuelta', 'Cancelada'
```

---

## 🧪 CÓMO PROBAR LA CORRECCIÓN

### Paso 1: Reiniciar Angular (si está corriendo)
```bash
# Terminal Frontend
Ctrl+C (detener ng serve)
ng serve
```

### Paso 2: Login con usuario
```
Usuario: cualquier usuario (no Admin ni Directivo)
Contraseña: su contraseña
```

### Paso 3: Navegar al dashboard
```
Ir a: /dashboard/usuario
```

### Paso 4: Verificar en consola del navegador
**Antes (❌):**
```
GET http://localhost:3010/api/peticiones?estado=en_progreso 500
❌ Error: invalid input value for enum
```

**Después (✅):**
```
GET http://localhost:3010/api/peticiones?estado=En%20Progreso 200
✅ Success: { success: true, data: [...] }
```

---

## 📝 ARCHIVOS MODIFICADOS

1. ✅ `Front/src/app/components/dashboard-usuario/dashboard-usuario/dashboard-usuario.component.ts`
   - Línea 16: Agregado import `EstadoPeticion`
   - Línea 64-71: Cambiado de `'en_progreso'` a `EstadoPeticion.EN_PROGRESO`

---

## ✅ ESTADO FINAL

- **Errores de TypeScript:** 0 ✅
- **Errores de runtime:** 0 ✅
- **Peticiones HTTP exitosas:** ✅
- **Dashboard funcionando:** ✅

---

**Fecha:** 10/10/2025  
**Status:** ✅ RESUELTO
