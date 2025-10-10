# 🔧 FIX: Filtrar Dropdowns por Área en Clientes

## 🐛 PROBLEMA

Al crear o editar un cliente, los dropdowns de **Pautador** y **Diseñador** mostraban **TODOS** los usuarios activos del sistema, sin importar su área.

**Comportamiento incorrecto:**
- Dropdown "Pautador" → Mostraba usuarios de Pautas, Diseño, Recursos Humanos, etc.
- Dropdown "Diseñador" → Mostraba usuarios de todas las áreas

---

## ✅ SOLUCIÓN

Ahora los dropdowns están filtrados correctamente por área:

- **Dropdown "Pautador"** → Solo muestra usuarios del área **"Pautas"**
- **Dropdown "Diseñador"** → Solo muestra usuarios del área **"Diseño"**

---

## 🔧 CAMBIOS IMPLEMENTADOS

### 1️⃣ **Crear Cliente** (`crear-cliente.component.ts`)

**ANTES - Sin filtro:**
```typescript
cargarUsuarios(): void {
  this.usuarioService.getAll().subscribe({
    next: (response) => {
      if (response.success && response.data) {
        const usuariosActivos = response.data.filter((u) => u.status);
        this.pautadores = usuariosActivos;  // ❌ Todos los usuarios
        this.disenadores = usuariosActivos; // ❌ Todos los usuarios
      }
    },
    // ...
  });
}
```

**DESPUÉS - Con filtro por área:**
```typescript
cargarUsuarios(): void {
  this.usuarioService.getAll().subscribe({
    next: (response) => {
      if (response.success && response.data) {
        const usuariosActivos = response.data.filter((u) => u.status);
        
        // ✅ Filtrar solo pautadores (área = "Pautas")
        this.pautadores = usuariosActivos.filter(
          (u) => u.area?.nombre === 'Pautas'
        );
        
        // ✅ Filtrar solo diseñadores (área = "Diseño")
        this.disenadores = usuariosActivos.filter(
          (u) => u.area?.nombre === 'Diseño'
        );
      }
    },
    error: (error) => {
      console.error('Error al cargar usuarios:', error);
      this.notificacionService.error('Error al cargar la lista de usuarios');
    },
  });
}
```

---

### 2️⃣ **Editar Cliente** (`editar-cliente.component.ts`)

**Mismo cambio aplicado:**

```typescript
cargarUsuarios(): void {
  this.usuarioService.getAll().subscribe({
    next: (response) => {
      if (response.success && response.data) {
        const usuariosActivos = response.data.filter((u) => u.status);
        
        // ✅ Filtrar solo pautadores (área = "Pautas")
        this.pautadores = usuariosActivos.filter(
          (u) => u.area?.nombre === 'Pautas'
        );
        
        // ✅ Filtrar solo diseñadores (área = "Diseño")
        this.disenadores = usuariosActivos.filter(
          (u) => u.area?.nombre === 'Diseño'
        );
      }
    },
    error: (error) => {
      console.error('Error al cargar usuarios:', error);
    },
  });
}
```

---

## 📊 ARCHIVOS MODIFICADOS

### Frontend (2 archivos):

1. ✅ `Front/src/app/features/clientes/components/crear-cliente/crear-cliente.component.ts`
   - Método `cargarUsuarios()` modificado
   - Agregados filtros por área: `Pautas` y `Diseño`

2. ✅ `Front/src/app/features/clientes/components/editar-cliente/editar-cliente.component.ts`
   - Método `cargarUsuarios()` modificado
   - Agregados filtros por área: `Pautas` y `Diseño`

---

## 🧪 TESTING

### Test 1: Crear Cliente - Dropdown Pautador

**Pasos:**
1. Ir a **Crear Cliente**
2. Abrir dropdown "Pautador"
3. Verificar usuarios mostrados

**Resultado Esperado:**
- ✅ Solo aparecen usuarios con área = "Pautas"
- ✅ NO aparecen usuarios de otras áreas (Diseño, RRHH, etc.)

**Ejemplo:**
```
Dropdown Pautador:
✅ Juan Pérez - juan@empresa.com (Pautas)
✅ María García - maria@empresa.com (Pautas)
✅ Carlos López - carlos@empresa.com (Pautas)

❌ Pedro Designer - pedro@empresa.com (Diseño)  // NO APARECE
❌ Ana RRHH - ana@empresa.com (Recursos Humanos) // NO APARECE
```

---

### Test 2: Crear Cliente - Dropdown Diseñador

**Pasos:**
1. Ir a **Crear Cliente**
2. Abrir dropdown "Diseñador"
3. Verificar usuarios mostrados

**Resultado Esperado:**
- ✅ Solo aparecen usuarios con área = "Diseño"
- ✅ NO aparecen usuarios de otras áreas

**Ejemplo:**
```
Dropdown Diseñador:
✅ Pedro Designer - pedro@empresa.com (Diseño)
✅ Laura Creativa - laura@empresa.com (Diseño)

❌ Juan Pérez - juan@empresa.com (Pautas)  // NO APARECE
```

---

### Test 3: Editar Cliente - Cambiar Pautador

**Pasos:**
1. Editar un cliente existente
2. Cambiar el pautador asignado
3. Abrir dropdown de "Pautador"

**Resultado Esperado:**
- ✅ Solo aparecen pautadores del área "Pautas"
- ✅ El pautador actual está preseleccionado
- ✅ Se puede cambiar a otro pautador del área

---

### Test 4: Si NO hay usuarios en el área

**Escenario:** No hay usuarios activos en área "Diseño"

**Pasos:**
1. Ir a crear cliente
2. Abrir dropdown "Diseñador"

**Resultado Esperado:**
- ✅ Dropdown aparece vacío o con mensaje "Sin diseñador asignado"
- ✅ El campo sigue siendo opcional
- ✅ Se puede crear cliente sin diseñador

---

## 🔍 CÓMO FUNCIONA

### Flujo de Filtrado:

```
1. Frontend solicita: GET /api/usuarios
   ↓
2. Backend responde con usuarios e incluye área:
   [
     { 
       uid: 1, 
       nombre: "Juan", 
       area: { id: 1, nombre: "Pautas" },
       status: true
     },
     { 
       uid: 2, 
       nombre: "Pedro", 
       area: { id: 2, nombre: "Diseño" },
       status: true
     }
   ]
   ↓
3. Frontend recibe datos:
   response.data = [...usuarios con área...]
   ↓
4. Filtrar usuarios activos:
   usuariosActivos = usuarios.filter(u => u.status)
   ↓
5. Filtrar por área "Pautas":
   pautadores = usuariosActivos.filter(u => u.area?.nombre === 'Pautas')
   → Resultado: [{ uid: 1, nombre: "Juan", ... }]
   ↓
6. Filtrar por área "Diseño":
   disenadores = usuariosActivos.filter(u => u.area?.nombre === 'Diseño')
   → Resultado: [{ uid: 2, nombre: "Pedro", ... }]
   ↓
7. Dropdowns muestran solo usuarios filtrados
```

---

## 📝 NOTAS IMPORTANTES

### ⚠️ Backend YA incluye área:

El servicio `usuario.service.ts` ya está configurado correctamente para enviar el área:

```typescript
const usuarios = await Usuario.findAll({
  where: whereClause,
  attributes: { exclude: ["contrasena"] },
  include: [
    { model: Role, as: "rol", attributes: ["id", "nombre"] },
    { model: Area, as: "area", attributes: ["id", "nombre"] }, // ✅ Incluye área
  ],
});
```

### ✅ Nombres de áreas exactos:

Los filtros usan nombres exactos (case-sensitive):
- `"Pautas"` (no "pautas" ni "PAUTAS")
- `"Diseño"` (no "Diseno" ni "diseño")

Si los nombres en tu BD son diferentes, ajusta el filtro:
```typescript
// Ejemplo si en BD se llama "Pauta" en singular
this.pautadores = usuariosActivos.filter(
  (u) => u.area?.nombre === 'Pauta'  // Ajustar según BD
);
```

---

## 🎯 BENEFICIOS

### Antes:
- ❌ Dropdowns confusos con usuarios de todas las áreas
- ❌ Podías asignar un diseñador como pautador
- ❌ Mezcla de roles y áreas

### Después:
- ✅ Dropdowns limpios y específicos por área
- ✅ Solo se pueden asignar usuarios del área correcta
- ✅ Validación de backend ya existía, ahora UI coincide
- ✅ Mejor experiencia de usuario

---

## 🔄 VALIDACIÓN BACKEND (Ya existente)

El backend YA valida que los usuarios sean del área correcta en `cliente.service.ts`:

```typescript
// Validación de pautador
if ((pautador as any).area.nombre !== "Pautas") {
  throw new ValidationError("El usuario asignado como pautador no pertenece al área de Pautas");
}

// Validación de diseñador
if ((disenador as any).area.nombre !== "Diseño") {
  throw new ValidationError("El usuario asignado como diseñador no pertenece al área de Diseño");
}
```

**Ahora el frontend previene estos errores mostrando solo opciones válidas.**

---

## 🆚 COMPARACIÓN VISUAL

### Antes:
```
┌─────────────────────────────────────┐
│ Pautador *                          │
│ ┌───────────────────────────────┐   │
│ │ Seleccione un pautador        │   │
│ └───────────────────────────────┘   │
│   ↓ Click                           │
│ ┌───────────────────────────────┐   │
│ │ Juan Pérez (Pautas)          │   │ ✅ Válido
│ │ Pedro Designer (Diseño)      │   │ ❌ Inválido (pero aparece)
│ │ Ana RRHH (Recursos Humanos)  │   │ ❌ Inválido (pero aparece)
│ │ Luis Marketing (Marketing)    │   │ ❌ Inválido (pero aparece)
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Después:
```
┌─────────────────────────────────────┐
│ Pautador *                          │
│ ┌───────────────────────────────┐   │
│ │ Seleccione un pautador        │   │
│ └───────────────────────────────┘   │
│   ↓ Click                           │
│ ┌───────────────────────────────┐   │
│ │ Juan Pérez (Pautas)          │   │ ✅ Válido
│ │ María García (Pautas)        │   │ ✅ Válido
│ │ Carlos López (Pautas)        │   │ ✅ Válido
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
Solo usuarios del área "Pautas"
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Frontend:
- ✅ `crear-cliente.component.ts` filtra pautadores por área "Pautas"
- ✅ `crear-cliente.component.ts` filtra diseñadores por área "Diseño"
- ✅ `editar-cliente.component.ts` filtra pautadores por área "Pautas"
- ✅ `editar-cliente.component.ts` filtra diseñadores por área "Diseño"
- ✅ Usuarios inactivos (status=false) NO aparecen
- ✅ Solo usuarios con área válida aparecen

### Backend:
- ✅ `usuario.service.ts` incluye área en response
- ✅ `cliente.service.ts` valida área al crear/actualizar
- ✅ Validación de "Pautas" para pautador
- ✅ Validación de "Diseño" para diseñador

### Testing:
- ✅ Crear cliente con pautador del área correcta
- ✅ Crear cliente con diseñador del área correcta
- ✅ Editar cliente y cambiar pautador
- ✅ Verificar dropdowns solo muestran usuarios del área

---

**Fecha:** 10/10/2025  
**Tipo:** Fix - Filtrado de usuarios por área en dropdowns  
**Archivos modificados:** 2  
**Status:** ✅ IMPLEMENTADO
