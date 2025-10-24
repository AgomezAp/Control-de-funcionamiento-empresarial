# 🔧 FIX: Peticiones de Gestión Administrativa Visibles para Pautadores

**Fecha:** Octubre 24, 2025
**Prioridad:** ALTA 🟠
**Estado:** ✅ RESUELTO

---

## 📋 Descripción del Problema

### Síntoma Reportado por Usuario
```
"Ahora me pasa que las peticiones de gestión administrativa no les aparecen 
a los pautadores, importante que solo le aparezca a los pautadores, no a 
diseñadores, ni a otras áreas, entonces necesito que me colabore a solucionar 
ese problema de que no aparece las peticiones que hace gestión administrativa 
para los de pautas, que es un problema muy grande"
```

**Impacto:**
- 🚨 Peticiones de **Gestión Administrativa** no aparecen a **Pautadores**
- ❌ Pautadores no pueden ver ni aceptar peticiones administrativas
- ⚠️ Las peticiones quedan pendientes sin poder ser atendidas

**Requerimiento:**
- ✅ Peticiones GA deben aparecer **SOLO a Pautadores**
- ❌ NO deben aparecer a Diseñadores
- ❌ NO deben aparecer a otras áreas

---

## 🔍 Análisis Técnico

### Causa Raíz

**Problema en `obtenerPendientes()` - Línea 376-404:**

El método estaba filtrando peticiones por **categorías** del área en lugar de por el campo **`area`** de la petición:

```typescript
// ❌ CÓDIGO ANTERIOR (INCORRECTO)
async obtenerPendientes(area?: string) {
  const whereClause: any = { estado: "Pendiente" };

  if (area) {
    // ❌ Filtraba por categorías, no por área de la petición
    const categoria = await Categoria.findAll({
      where: { area_tipo: area },
      attributes: ["id"],
    });

    const categoriasIds = categoria.map((c) => c.id);
    whereClause.categoria_id = categoriasIds;
  }
  
  // ... resto del método
}
```

**Problema:**
1. Cuando un Pautador solicita peticiones pendientes con `area = "Pautas"`
2. El código busca todas las **categorías** de tipo "Pautas"
3. Filtra peticiones que usan esas categorías
4. **PERO:** Las peticiones de GA usan categorías de "Gestión Administrativa"
5. **Resultado:** Las peticiones GA nunca aparecen a los Pautadores

### Problema Secundario en `aceptarPeticion()`

**Validación incorrecta - Línea 414-434:**

```typescript
// ❌ CÓDIGO ANTERIOR (INCORRECTO)
// Verificar que el usuario sea del área correcta
const categoria = await Categoria.findByPk(peticion.categoria_id);
const usuarioArea = await Area.findOne({ where: { nombre: usuarioActual.area } });

// ❌ Comparaba área de la categoría, no de la petición
if (categoria?.area_tipo !== usuarioArea?.nombre) {
  throw new ForbiddenError(
    `Solo usuarios del área de ${categoria?.area_tipo} pueden aceptar esta petición`
  );
}
```

**Problema:**
- Aunque un Pautador pudiera ver una petición GA, no podría aceptarla
- La validación comparaba `categoria.area_tipo` vs `usuarioArea.nombre`
- Rechazaba la aceptación porque las áreas no coincidían

---

## ✅ Solución Aplicada

### 🔧 Fix 1: Filtrado Correcto en `obtenerPendientes()`

**Archivo:** `Backend/src/services/peticion.service.ts` (línea 376-404)

```typescript
// ✅ CÓDIGO NUEVO (CORRECTO)
async obtenerPendientes(area?: string) {
  const whereClause: any = { estado: "Pendiente" };

  // ✅ CORRECCIÓN: Filtrar directamente por el campo "area" de la petición
  // en lugar de por categorías (permite filtrar Pautas correctamente)
  if (area) {
    // Si el área es "Pautas", mostrar peticiones de Pautas Y Gestión Administrativa
    if (area === "Pautas") {
      whereClause.area = ["Pautas", "Gestión Administrativa"];
    } else {
      // Para Diseño u otras áreas, solo mostrar sus propias peticiones
      whereClause.area = area;
    }
  }

  return await Peticion.findAll({
    where: whereClause,
    include: [
      {
        model: Cliente,
        as: "cliente",
        attributes: ["id", "nombre"],
      },
      {
        model: Categoria,
        as: "categoria",
        attributes: ["id", "nombre", "area_tipo"],
      },
      {
        model: Usuario,
        as: "creador",
        attributes: ["uid", "nombre_completo"],
      },
    ],
    order: [["fecha_creacion", "ASC"]],
  });
}
```

**Cambios clave:**
1. ✅ Filtra directamente por `peticion.area` (no por categorías)
2. ✅ Si `area === "Pautas"`: retorna peticiones de **Pautas Y Gestión Administrativa**
3. ✅ Si `area === "Diseño"`: retorna **solo** peticiones de Diseño
4. ✅ Otras áreas: retornan solo sus propias peticiones

---

### 🔧 Fix 2: Validación Correcta en `aceptarPeticion()`

**Archivo:** `Backend/src/services/peticion.service.ts` (línea 414-445)

```typescript
// ✅ CÓDIGO NUEVO (CORRECTO)
async aceptarPeticion(id: number, usuarioActual: any) {
  const peticion = await Peticion.findByPk(id);

  if (!peticion) {
    throw new NotFoundError("Petición no encontrada");
  }

  if (peticion.estado !== "Pendiente") {
    throw new ValidationError("Solo se pueden aceptar peticiones pendientes");
  }

  // ✅ CORRECCIÓN: Verificar permisos según el área de la petición
  const usuarioArea = await Area.findOne({ where: { nombre: usuarioActual.area } });

  // Los pautadores pueden aceptar peticiones de Pautas Y Gestión Administrativa
  if (usuarioArea?.nombre === "Pautas") {
    if (peticion.area !== "Pautas" && peticion.area !== "Gestión Administrativa") {
      throw new ForbiddenError(
        `Solo usuarios de Pautas pueden aceptar peticiones de Pautas y Gestión Administrativa`
      );
    }
  } else {
    // Otras áreas solo pueden aceptar sus propias peticiones
    if (peticion.area !== usuarioArea?.nombre) {
      throw new ForbiddenError(
        `Solo usuarios del área de ${peticion.area} pueden aceptar esta petición`
      );
    }
  }

  // Iniciar temporizador automáticamente
  const fecha_aceptacion = new Date();
  
  // ... resto del método
}
```

**Cambios clave:**
1. ✅ Valida contra `peticion.area` (no contra `categoria.area_tipo`)
2. ✅ **Pautadores** pueden aceptar peticiones de **Pautas Y Gestión Administrativa**
3. ✅ **Diseñadores** solo pueden aceptar peticiones de **Diseño**
4. ✅ Otras áreas solo pueden aceptar sus propias peticiones

---

## 📊 Matriz de Permisos

### Antes del Fix ❌

| Área Usuario | Peticiones Visibles | Peticiones Aceptables |
|--------------|---------------------|----------------------|
| Pautas | ❌ Solo Pautas | ❌ Solo Pautas |
| Diseño | ✅ Solo Diseño | ✅ Solo Diseño |
| Gestión Administrativa | ✅ Solo GA | ✅ Solo GA |

**Problema:** Peticiones GA quedaban pendientes sin poder ser atendidas

---

### Después del Fix ✅

| Área Usuario | Peticiones Visibles | Peticiones Aceptables |
|--------------|---------------------|----------------------|
| Pautas | ✅ Pautas + GA | ✅ Pautas + GA |
| Diseño | ✅ Solo Diseño | ✅ Solo Diseño |
| Gestión Administrativa | ✅ Solo GA | ✅ Solo GA |

**Solución:** Pautadores ahora ven y pueden aceptar peticiones GA ✅

---

## 🧪 Testing Requerido

### 1. Testing Pautador ve Peticiones GA

**Usuario Pautador:** juan.pautas@empresa.com

**Pasos:**
```bash
1. Login como Pautador
2. Ir a Dashboard Usuario
3. Verificar sección "Peticiones Pendientes"
4. Resultado esperado:
   ✅ Aparecen peticiones de área "Pautas"
   ✅ Aparecen peticiones de área "Gestión Administrativa"
   ❌ NO aparecen peticiones de área "Diseño"
```

### 2. Testing Pautador acepta Petición GA

**Usuario Pautador:** juan.pautas@empresa.com

**Pasos:**
```bash
1. Login como Pautador
2. Ver petición de Gestión Administrativa (creada por Karen Delgado)
3. Clic "Aceptar Petición"
4. Resultado esperado:
   ✅ Petición aceptada exitosamente
   ✅ Estado cambia a "En Progreso"
   ✅ Usuario asignado: juan.pautas@empresa.com
   ✅ Temporizador iniciado automáticamente
   ❌ NO debe mostrar error de permisos
```

### 3. Testing Diseñador NO ve Peticiones GA

**Usuario Diseñador:** carlos.diseno@empresa.com

**Pasos:**
```bash
1. Login como Diseñador
2. Ir a Dashboard Usuario
3. Verificar sección "Peticiones Pendientes"
4. Resultado esperado:
   ✅ Aparecen peticiones de área "Diseño"
   ❌ NO aparecen peticiones de área "Pautas"
   ❌ NO aparecen peticiones de área "Gestión Administrativa"
```

### 4. Testing GA crea y Pautador recibe

**Flujo completo:**
```bash
# Paso 1: GA crea petición
Usuario: laura.admin@empresa.com (Gestión Administrativa)
Acción: Crear petición → Categoría "Consulta general del cliente"
Resultado: Petición creada con area = "Gestión Administrativa"

# Paso 2: Pautador ve la petición
Usuario: juan.pautas@empresa.com (Pautas)
Acción: Revisar Dashboard → Peticiones Pendientes
Resultado esperado:
✅ Petición aparece en la lista
✅ Muestra badge azul "Gestión Administrativa"
✅ Muestra cliente "Tienda Fashion Style"
✅ Costo: $0 (categorías GA sin costo)

# Paso 3: Pautador acepta
Acción: Clic "Aceptar Petición"
Resultado esperado:
✅ Petición aceptada sin errores
✅ Estado: "En Progreso"
✅ Asignado a: juan.pautas@empresa.com
✅ Temporizador activo
```

---

## 📊 Impacto del Fix

### Antes del Fix ❌
- **Peticiones GA:** Quedaban pendientes indefinidamente
- **Pautadores:** NO veían peticiones GA
- **Diseñadores:** Correctamente aislados (solo ven Diseño)
- **Resultado:** Peticiones GA sin atender ⚠️

### Después del Fix ✅
- **Peticiones GA:** Visibles para Pautadores
- **Pautadores:** Ven Pautas + GA (pueden aceptar ambas)
- **Diseñadores:** Siguen aislados (solo ven Diseño)
- **Resultado:** Todas las peticiones pueden ser atendidas ✅

---

## 🔄 Archivos Modificados

### Backend (1 archivo, 2 métodos)

**Archivo:** `Backend/src/services/peticion.service.ts`

**Cambio 1 - obtenerPendientes() (línea 376-404):**
```typescript
// Filtrado por área de petición (no por categorías)
if (area === "Pautas") {
  whereClause.area = ["Pautas", "Gestión Administrativa"];
} else {
  whereClause.area = area;
}
```

**Cambio 2 - aceptarPeticion() (línea 414-445):**
```typescript
// Validación permite a Pautas aceptar GA
if (usuarioArea?.nombre === "Pautas") {
  if (peticion.area !== "Pautas" && peticion.area !== "Gestión Administrativa") {
    throw new ForbiddenError(...);
  }
}
```

---

## 🔗 Lógica de Negocio

### ¿Por qué Pautadores atienden Gestión Administrativa?

**Razón de diseño:**

1. **Gestión Administrativa** maneja tareas operativas rápidas:
   - Consultas generales de clientes
   - Solicitudes de información
   - Problemas de facturación
   - Reportes mensuales

2. **Pautadores** tienen perfil operativo similar:
   - Atienden peticiones de estrategias de seguimiento
   - Gestionan campañas publicitarias
   - Trabajan con clientes directamente

3. **Diseñadores** tienen perfil creativo diferente:
   - Crean diseños gráficos
   - Trabajan en proyectos visuales
   - Requieren tiempo creativo dedicado

**Conclusión:** Los **Pautadores** son el área más adecuada para atender peticiones de **Gestión Administrativa** por similitud en el perfil operativo.

---

## 🐛 Debugging Tips

### Si Pautadores no ven peticiones GA:

**1. Verificar request en backend logs:**
```bash
# En logs del backend al llamar GET /api/peticiones/pendientes?area=Pautas
# Debe mostrar:
✅ WHERE area IN ('Pautas', 'Gestión Administrativa')
❌ Si muestra otra cosa, el fix no se aplicó
```

**2. Verificar response del backend:**
```javascript
// GET /api/peticiones/pendientes?area=Pautas
{
  "success": true,
  "data": [
    {
      "id": 123,
      "area": "Pautas",  // ✅ Debe aparecer
      "estado": "Pendiente",
      // ...
    },
    {
      "id": 124,
      "area": "Gestión Administrativa",  // ✅ Debe aparecer
      "estado": "Pendiente",
      // ...
    }
  ]
}
```

**3. Verificar en BD que peticiones GA existen:**
```sql
SELECT id, area, estado, cliente_id, categoria_id 
FROM peticiones 
WHERE area = 'Gestión Administrativa' 
  AND estado = 'Pendiente';

-- Debe retornar peticiones creadas por GA
```

**4. Verificar que backend se reinició:**
```bash
cd Backend
npm run dev

# Debe mostrar:
# Server running on port 3010
# Sin errores TypeScript
```

---

## 📞 Resolución

**Usuario Reportó:** Usuario del sistema  
**Problema:** Peticiones GA no visibles para Pautadores  
**Resuelto Por:** GitHub Copilot + Developer  
**Fecha Resolución:** Octubre 24, 2025  
**Prioridad:** 🟠 ALTA - Funcionalidad bloqueada  
**Estado:** ✅ RESUELTO (Pendiente testing manual)

---

## 🔗 Documentos Relacionados

- `FIX_BUG_VALIDADOR_DESCRIPCION_EXTRA_GA_COMPLETO.md` - Bug validación descripción GA
- `FIX_PERMISOS_GESTION_ADMINISTRATIVA.md` - Permisos sidebar GA
- `IMPLEMENTACION_TIPO_CLIENTE.md` - Sistema de áreas
- `SISTEMA_COMPLETO.md` - Arquitectura general

---

## ✅ Checklist Final de Resolución

### Código
- [x] ✅ Fix método `obtenerPendientes()` línea 376
- [x] ✅ Fix método `aceptarPeticion()` línea 414
- [x] ✅ Compilación backend sin errores
- [x] ✅ Lógica de permisos correcta (Pautas ve GA)
- [x] ✅ Lógica de aislamiento correcta (Diseño no ve GA)
- [x] ✅ Documentado problema y solución completa

### Testing (Pendiente usuario)
- [ ] ⏳ Testing Pautador ve peticiones GA
- [ ] ⏳ Testing Pautador acepta peticiones GA
- [ ] ⏳ Testing Diseñador NO ve peticiones GA
- [ ] ⏳ Testing flujo completo GA crea → Pautador acepta
- [ ] ⏳ Verificar logs backend sin errores

### Deploy (Pendiente)
- [ ] ⏳ Reiniciar servidor backend (si no usa nodemon)
- [ ] ⏳ Testing en producción
- [ ] ⏳ Validar con usuarios reales

---

## 🎯 Resultado Esperado

**Flujo exitoso:**

```
1. GA (Karen Delgado) crea petición
   ↓
2. Petición guardada con area = "Gestión Administrativa"
   ↓
3. Pautador (Juan) ve petición en Dashboard
   ↓
4. Pautador acepta petición
   ↓
5. Petición pasa a "En Progreso" asignada a Pautador
   ↓
6. Pautador completa trabajo
   ↓
7. Petición finalizada ✅
```

---

**Estado Final:** ✅ RESUELTO - PAUTADORES PUEDEN VER Y ACEPTAR PETICIONES GA  
**Próximo Paso:** 🧪 TESTING MANUAL CON USUARIOS PAUTADORES
