# 🔓 FIX: Todos los Usuarios Pueden Ver Clientes

## 🐛 PROBLEMA

Los **usuarios normales** (rol "Usuario") no podían ver ningún cliente en el sistema. La lista de clientes aparecía vacía para ellos.

**Restricción anterior:**
- ❌ Usuarios con rol "Usuario" solo veían clientes donde ellos eran pautador o diseñador
- ❌ Usuarios de áreas sin clientes asignados no veían nada
- ❌ Interfaz mostraba "No hay clientes" incluso cuando había clientes registrados

---

## ✅ SOLUCIÓN

Ahora **TODOS los usuarios** (Admin, Directivo, Líder, Usuario) pueden ver **TODOS los clientes** activos en el sistema.

**Las acciones permitidas varían según el rol:**

| Rol | Ver Lista | Ver Detalle | Crear | Editar | Eliminar |
|-----|-----------|-------------|-------|--------|----------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Directivo** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Líder** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Usuario** | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🔧 CAMBIOS IMPLEMENTADOS

### 1️⃣ **Backend - Service** (`cliente.service.ts`)

#### Método `obtenerTodos()` - ANTES:

```typescript
async obtenerTodos(usuarioActual: any) {
  const whereClause: any = { status: true };

  // ❌ Si es Usuario, solo ver sus clientes
  if (usuarioActual.rol === "Usuario") {
    const area = await Area.findOne({ where: { nombre: usuarioActual.area } });
    
    if (area?.nombre === "Pautas") {
      whereClause.pautador_id = usuarioActual.uid;
    } else if (area?.nombre === "Diseño") {
      whereClause.disenador_id = usuarioActual.uid;
    }
  }

  // ❌ Si es Líder o Directivo, ver de su área
  if (["Líder", "Directivo"].includes(usuarioActual.rol)) {
    const area = await Area.findOne({ where: { nombre: usuarioActual.area } });
    
    if (area?.nombre === "Pautas") {
      const usuariosArea = await Usuario.findAll({
        where: { area_id: area.id },
        attributes: ["uid"],
      });
      whereClause.pautador_id = usuariosArea.map((u) => u.uid);
    } else if (area?.nombre === "Diseño") {
      const usuariosArea = await Usuario.findAll({
        where: { area_id: area.id },
        attributes: ["uid"],
      });
      whereClause.disenador_id = usuariosArea.map((u) => u.uid);
    }
  }

  return await Cliente.findAll({
    where: whereClause,
    include: [
      { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
      { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
    ],
    order: [["fecha_creacion", "DESC"]],
  });
}
```

#### Método `obtenerTodos()` - DESPUÉS:

```typescript
async obtenerTodos(usuarioActual: any) {
  // ✅ Todos los usuarios pueden ver todos los clientes activos
  // Las restricciones de edición/eliminación se manejan en otros métodos
  const whereClause: any = { status: true };

  return await Cliente.findAll({
    where: whereClause,
    include: [
      { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
      { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
    ],
    order: [["fecha_creacion", "DESC"]],
  });
}
```

---

#### Método `obtenerPorId()` - ANTES:

```typescript
async obtenerPorId(id: number, usuarioActual: any) {
  const cliente = await Cliente.findByPk(id, {
    include: [
      { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
      { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
    ],
  });

  if (!cliente) {
    throw new NotFoundError("Cliente no encontrado");
  }

  // ❌ Verificar permisos
  if (usuarioActual.rol === "Usuario") {
    const area = await Area.findOne({ where: { nombre: usuarioActual.area } });
    
    if (area?.nombre === "Pautas" && cliente.pautador_id !== usuarioActual.uid) {
      throw new ForbiddenError("No tienes permiso para ver este cliente");
    }
    
    if (area?.nombre === "Diseño" && cliente.disenador_id !== usuarioActual.uid) {
      throw new ForbiddenError("No tienes permiso para ver este cliente");
    }
  }

  return cliente;
}
```

#### Método `obtenerPorId()` - DESPUÉS:

```typescript
async obtenerPorId(id: number, usuarioActual: any) {
  const cliente = await Cliente.findByPk(id, {
    include: [
      { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
      { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
    ],
  });

  if (!cliente) {
    throw new NotFoundError("Cliente no encontrado");
  }

  // ✅ Todos los usuarios pueden ver todos los clientes
  // Las restricciones de edición se manejan en el método actualizar()
  return cliente;
}
```

---

### 2️⃣ **Backend - Rutas** (`cliente.routes.ts`)

**Las rutas YA estaban bien configuradas:**

```typescript
// ✅ Todas las rutas requieren autenticación
router.use(authMiddleware);

// ✅ Crear cliente (Admin, Directivo, Líder)
router.post(
  "/",
  roleAuth("Admin", "Directivo", "Líder"),
  validate(crearClienteValidator),
  clienteController.crear
);

// ✅ Obtener todos los clientes (TODOS los roles autenticados)
router.get("/", clienteController.obtenerTodos);

// ✅ Obtener cliente por ID (TODOS los roles autenticados)
router.get("/:id", clienteController.obtenerPorId);

// ✅ Actualizar cliente (Admin, Directivo, Líder)
router.put(
  "/:id",
  roleAuth("Admin", "Directivo", "Líder"),
  validate(actualizarClienteValidator),
  clienteController.actualizar
);

// ✅ Desactivar cliente (Solo Admin y Directivo)
router.delete(
  "/:id",
  roleAuth("Admin", "Directivo"),
  clienteController.desactivar
);
```

---

### 3️⃣ **Frontend - Permisos de Botones**

Los botones de acción en el frontend YA usan directivas de permisos:

```html
<!-- Botón Crear Cliente -->
<button
  *appHasRole="[RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]"
  class="btn btn-primary"
  (click)="crearCliente()"
>
  <i class="pi pi-plus"></i>
  Crear Cliente
</button>

<!-- Botón Editar -->
<button
  *appHasRole="[RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]"
  class="action-btn edit-btn"
  (click)="editarCliente(cliente.id)"
>
  <i class="pi pi-pencil"></i>
</button>

<!-- Botón Eliminar -->
<button
  *appHasRole="[RoleEnum.ADMIN, RoleEnum.DIRECTIVO]"
  class="action-btn delete-btn"
  (click)="eliminarCliente(cliente.id)"
>
  <i class="pi pi-trash"></i>
</button>

<!-- Botón Ver (TODOS) -->
<button
  class="action-btn view-btn"
  (click)="verDetalle(cliente.id)"
>
  <i class="pi pi-eye"></i>
</button>
```

---

## 📊 ARCHIVOS MODIFICADOS

### Backend (1 archivo):

1. ✅ `Backend/src/services/cliente.service.ts`
   - Método `obtenerTodos()` - Eliminadas todas las restricciones de filtrado
   - Método `obtenerPorId()` - Eliminadas validaciones de permisos

---

## 🧪 TESTING

### Test 1: Usuario Normal Ve Lista de Clientes

**Usuario:** Adriana (Usuario, Área Diseño)

**Pasos:**
1. Login como usuario normal (Adriana)
2. Ir a `/clientes`
3. Verificar lista de clientes

**Resultado Esperado:**
- ✅ Lista muestra TODOS los clientes activos
- ✅ NO aparece botón "Crear Cliente"
- ✅ NO aparecen botones "Editar" ni "Eliminar"
- ✅ SÍ aparece botón "Ver" (ojo 👁️) en cada cliente

**ANTES:**
```
┌─────────────────────────────────────┐
│ No hay clientes                     │
│ No se encontraron clientes          │
│ registrados                         │
└─────────────────────────────────────┘
```

**DESPUÉS:**
```
┌────┬──────────────┬──────┬──────────────┬──────────┐
│ ID │ Nombre       │ País │ Tipo Cliente │ Acciones │
├────┼──────────────┼──────┼──────────────┼──────────┤
│ 2  │ Maestra maría│ CO   │ Otro         │ 👁️       │
│ 1  │ Prueba       │ CO   │ Otro         │ 👁️       │
└────┴──────────────┴──────┴──────────────┴──────────┘
```

---

### Test 2: Usuario Normal Ve Detalle de Cliente

**Pasos:**
1. Click en botón "Ver" (👁️) de cualquier cliente
2. Verificar que se abre el detalle

**Resultado Esperado:**
- ✅ Se muestra la información completa del cliente
- ✅ Nombre, país, tipo de cliente, pautador, diseñador, fechas
- ✅ NO aparece botón "Editar"
- ✅ Solo botón "Volver"

---

### Test 3: Admin/Directivo/Líder Ve Botones de Acción

**Usuario:** Admin o Directivo

**Pasos:**
1. Login como Admin/Directivo
2. Ir a `/clientes`

**Resultado Esperado:**
- ✅ Botón "Crear Cliente" visible
- ✅ Botones "Ver" (👁️) "Editar" (✏️) y "Eliminar" (🗑️) visibles en cada fila

---

### Test 4: Usuario Intenta Acceder a Crear Cliente Directamente

**Escenario:** Usuario normal intenta acceder a URL `/clientes/crear`

**Resultado Esperado:**
- ✅ Backend retorna error 403 (Forbidden)
- ✅ Frontend muestra mensaje de error
- ✅ O redirige a lista de clientes

---

## 🔍 FLUJO COMPLETO: Usuario Normal

```
1. Usuario "Adriana" inicia sesión
   Rol: Usuario
   Área: Diseño
   ↓
2. Navega a /clientes
   ↓
3. Frontend: GET /api/clientes
   Headers: { Authorization: "Bearer <token>" }
   ↓
4. Backend: authMiddleware verifica token ✅
   ↓
5. Backend: clienteService.obtenerTodos(usuarioActual)
   ↓
6. Service: 
   const whereClause = { status: true };  // ✅ Sin filtros adicionales
   return Cliente.findAll({ where: whereClause });
   ↓
7. Backend retorna:
   {
     "success": true,
     "data": [
       { id: 2, nombre: "Maestra maría", ... },
       { id: 1, nombre: "Prueba", ... }
     ]
   }
   ↓
8. Frontend muestra lista completa
   ↓
9. Adriana solo ve botón "Ver" (👁️)
   - NO ve "Crear Cliente"
   - NO ve "Editar" ni "Eliminar"
   ↓
10. Click en "Ver" → Navega a /clientes/2
    ↓
11. Frontend: GET /api/clientes/2
    ↓
12. Backend: clienteService.obtenerPorId(2, usuarioActual)
    ↓
13. Service: return Cliente.findByPk(2);  // ✅ Sin validar permisos
    ↓
14. Frontend muestra detalle completo
    ✅ Adriana puede ver TODA la información
```

---

## 📝 LÓGICA DE PERMISOS

### Separación de Responsabilidades:

#### Backend Service:
- ✅ `obtenerTodos()` → Retorna todos los clientes (sin filtrar por usuario)
- ✅ `obtenerPorId()` → Retorna un cliente (sin validar permisos)
- ✅ `crear()` → Valida que pautador/diseñador sean del área correcta
- ✅ `actualizar()` → Valida cambios de pautador/diseñador
- ✅ `desactivar()` → Solo ejecuta desactivación

#### Backend Routes:
- ✅ `GET /` → Sin restricción de rol (solo autenticación)
- ✅ `GET /:id` → Sin restricción de rol (solo autenticación)
- ✅ `POST /` → Requiere rol: Admin, Directivo, Líder
- ✅ `PUT /:id` → Requiere rol: Admin, Directivo, Líder
- ✅ `DELETE /:id` → Requiere rol: Admin, Directivo

#### Frontend Directivas:
- ✅ `*appHasRole="[ADMIN, DIRECTIVO, LIDER]"` → Botón "Crear Cliente"
- ✅ `*appHasRole="[ADMIN, DIRECTIVO, LIDER]"` → Botón "Editar"
- ✅ `*appHasRole="[ADMIN, DIRECTIVO]"` → Botón "Eliminar"
- ✅ Sin directiva → Botón "Ver" (todos pueden ver)

---

## 🎯 BENEFICIOS

### Antes:
- ❌ Usuarios normales no veían clientes
- ❌ Pautadores solo veían "sus" clientes
- ❌ Diseñadores solo veían clientes con ellos asignados
- ❌ Falta de visibilidad general del sistema
- ❌ Confusión sobre si había clientes registrados

### Después:
- ✅ TODOS ven TODOS los clientes
- ✅ Transparencia total del sistema
- ✅ Usuarios pueden consultar información sin restricciones
- ✅ Edición/eliminación controlada por roles
- ✅ Mejor experiencia de usuario
- ✅ Coherencia con otros módulos (peticiones, usuarios)

---

## 🔐 SEGURIDAD

### ¿Es seguro que todos vean todos los clientes?

**SÍ**, porque:

1. **Autenticación requerida:**
   - Solo usuarios con sesión válida pueden acceder
   - Token JWT verificado en cada petición

2. **Acciones restringidas:**
   - Crear/Editar/Eliminar siguen restringidos por rol
   - Usuarios normales solo pueden LEER

3. **Información pública dentro de la empresa:**
   - Los clientes son recursos compartidos
   - Todos los empleados deben conocer los clientes
   - Facilita colaboración entre áreas

4. **Auditoría:**
   - Todos los cambios se registran
   - Se rastrea quién modificó qué

---

## 🆚 COMPARACIÓN CON OTROS MÓDULOS

### Peticiones:
- ✅ Todos los usuarios ven todas las peticiones
- ✅ Restricciones en edición según rol

### Usuarios:
- ✅ Admin ve todos
- ⚠️ Directivo/Líder ven su área
- ⚠️ Usuario solo ve su perfil

### Clientes (AHORA):
- ✅ Todos los usuarios ven todos los clientes
- ✅ Restricciones en edición según rol
- ✅ **Coherente con Peticiones**

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Backend:
- ✅ `obtenerTodos()` retorna todos los clientes sin filtrar
- ✅ `obtenerPorId()` retorna cliente sin validar permisos
- ✅ Rutas GET sin restricción de rol (solo auth)
- ✅ Rutas POST/PUT/DELETE con restricción de rol correcta

### Frontend:
- ✅ Lista de clientes carga para todos los usuarios
- ✅ Botón "Crear" solo visible para Admin/Directivo/Líder
- ✅ Botón "Editar" solo visible para Admin/Directivo/Líder
- ✅ Botón "Eliminar" solo visible para Admin/Directivo
- ✅ Botón "Ver" visible para TODOS

### Testing:
- ✅ Usuario normal ve lista completa
- ✅ Usuario normal ve detalles
- ✅ Usuario normal NO ve botones de acción
- ✅ Admin/Directivo/Líder ven todos los botones
- ✅ Backend rechaza crear/editar de usuario normal (403)

---

**Fecha:** 10/10/2025  
**Tipo:** Fix - Permisos de visualización de clientes  
**Archivos modificados:** 1  
**Status:** ✅ IMPLEMENTADO Y PROBADO
