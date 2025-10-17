# Fix: Usuario que resolvió la petición no aparece en Detalle de Facturación

## 🐛 Problema Reportado

**Síntoma:**
- En el detalle de facturación, la tabla de peticiones mostraba "N/A" en la columna "Usuario"
- El nombre del usuario que resolvió cada petición no aparecía
- El problema afectaba tanto la vista web como el PDF exportado

**Causa Raíz:**
1. **Backend:** El servicio de facturación NO incluía la relación con el modelo `Usuario` al consultar peticiones
2. **Frontend:** Usaba el campo incorrecto `usuario_resolvio` en lugar de `asignado`

---

## ✅ Solución Implementada

### 1. Backend - Servicio de Facturación

**Archivo:** `Backend/src/services/facturacion.service.ts`

#### 1.1. Importación del modelo Usuario

**Agregado en línea 6:**
```typescript
import Usuario from "../models/Usuario";
```

#### 1.2. Inclusión de relación en consulta de Peticiones Activas

**Antes (líneas 137-147):**
```typescript
const peticionesActivas = await Peticion.findAll({
  where: {
    cliente_id,
    fecha_creacion: {
      [Op.between]: [fechaInicio, fechaFin],
    },
  },
  include: [
    { model: Categoria, as: "categoria", attributes: ["nombre", "area_tipo"] },
  ],
});
```

**Después:**
```typescript
const peticionesActivas = await Peticion.findAll({
  where: {
    cliente_id,
    fecha_creacion: {
      [Op.between]: [fechaInicio, fechaFin],
    },
  },
  include: [
    { model: Categoria, as: "categoria", attributes: ["nombre", "area_tipo"] },
    { 
      model: Usuario, 
      as: "asignado", 
      attributes: ["uid", "nombre_completo", "correo"] 
    },
  ],
});
```

**Impacto:** Ahora las peticiones activas incluyen los datos del usuario asignado.

---

#### 1.3. Inclusión de relación en consulta de Peticiones Históricas

**Antes (líneas 149-159):**
```typescript
const peticionesHistorico = await PeticionHistorico.findAll({
  where: {
    cliente_id,
    fecha_creacion: {
      [Op.between]: [fechaInicio, fechaFin],
    },
  },
  include: [
    { model: Categoria, as: "categoria", attributes: ["nombre", "area_tipo"] },
  ],
});
```

**Después:**
```typescript
const peticionesHistorico = await PeticionHistorico.findAll({
  where: {
    cliente_id,
    fecha_creacion: {
      [Op.between]: [fechaInicio, fechaFin],
    },
  },
  include: [
    { model: Categoria, as: "categoria", attributes: ["nombre", "area_tipo"] },
    { 
      model: Usuario, 
      as: "asignado", 
      attributes: ["uid", "nombre_completo", "correo"] 
    },
  ],
});
```

**Impacto:** Las peticiones históricas también incluyen datos del usuario asignado.

---

### 2. Frontend - Vista de Detalle

**Archivo:** `Front/src/app/features/facturacion/components/detalle-facturacion/detalle-facturacion.component.html`

**Antes (líneas 212-217):**
```html
<td>
  <div class="user-cell">
    <i class="pi pi-user"></i>
    <span>{{ peticion.usuario_resolvio?.nombre_completo || 'N/A' }}</span>
  </div>
</td>
```

**Después:**
```html
<td>
  <div class="user-cell">
    <i class="pi pi-user"></i>
    <span>{{ peticion.asignado?.nombre_completo || 'N/A' }}</span>
  </div>
</td>
```

**Motivo:** El backend devuelve el objeto con la clave `asignado`, no `usuario_resolvio`.

---

### 3. Frontend - Exportación PDF

**Archivo:** `Front/src/app/features/facturacion/components/detalle-facturacion/detalle-facturacion.component.ts`

**Antes (línea 294):**
```typescript
<td>${pet.usuario_resolvio?.nombre_completo || 'N/A'}</td>
```

**Después:**
```typescript
<td>${pet.asignado?.nombre_completo || 'N/A'}</td>
```

**Impacto:** El PDF exportado ahora muestra correctamente el usuario que resolvió cada petición.

---

## 📊 Estructura de Datos

### Modelo de Petición
```typescript
export class Peticion extends Model {
  public id!: number;
  public cliente_id!: number;
  public categoria_id!: number;
  public asignado_a!: number | null;  // ← ID del usuario asignado
  // ... otros campos
}
```

### Relación en Relaciones.ts
```typescript
Peticion.belongsTo(Usuario, {
  foreignKey: "asignado_a",
  as: "asignado",  // ← Nombre de la relación
});
```

### Respuesta del API
```json
{
  "success": true,
  "data": {
    "periodo": { ... },
    "detalle_peticiones": [
      {
        "id": 1,
        "categoria": { "nombre": "Creación de pieza publicitaria" },
        "asignado": {                        // ← Objeto del usuario
          "uid": "uuid-123",
          "nombre_completo": "Carlos López - Diseñador",
          "correo": "carlos.diseno@empresa.com"
        },
        "fecha_resolucion": "2025-10-17",
        "costo": 30000
      }
    ]
  }
}
```

---

## 🧪 Pruebas de Verificación

### 1. Verificar Vista Web

**Pasos:**
1. Ir a **Facturación** → **Resumen Global**
2. Abrir cualquier periodo de facturación
3. Ir a sección "Detalle de Peticiones"
4. Observar columna "Usuario"

**Resultado esperado:**
```
┌────┬──────────────────────────┬──────────────────────────┬─────────────┬──────────┐
│ ID │ Categoría                │ Usuario                  │ Fecha       │ Costo    │
├────┼──────────────────────────┼──────────────────────────┼─────────────┼──────────┤
│ #1 │ Creación de pieza pub... │ Carlos López - Diseñador │ 17/10/2025  │ $30,000  │
│ #2 │ Ajuste de diseño         │ Ana Martínez - Diseñadora│ 17/10/2025  │ $80,000  │
└────┴──────────────────────────┴──────────────────────────┴─────────────┴──────────┘
```

**Antes del fix:** Mostraba "N/A" en todos los usuarios  
**Después del fix:** Muestra el nombre completo del usuario asignado

---

### 2. Verificar PDF Exportado

**Pasos:**
1. Abrir detalle de facturación
2. Click en **"Exportar PDF"**
3. Abrir el PDF descargado
4. Ver tabla "Detalle de Peticiones"

**Resultado esperado en PDF:**
```
Detalle de Peticiones
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID  Categoría                      Usuario                  Fecha        Costo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#1  Creación de pieza publicitaria Carlos López - Diseñador 17/10/2025  $30,000.00
#2  Ajuste de diseño                Ana Martínez - Diseñadora 17/10/2025  $80,000.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3. Verificar Respuesta del API (DevTools)

**Pasos:**
1. Abrir DevTools (F12) → Pestaña "Network"
2. Ir a detalle de facturación
3. Buscar llamada: `GET /api/facturacion/periodos/:clienteId/:año/:mes/detalle`
4. Click en la petición → "Preview" o "Response"

**Respuesta esperada debe incluir:**
```json
{
  "detalle_peticiones": [
    {
      "id": 1,
      "categoria": {
        "nombre": "Creación de pieza publicitaria",
        "area_tipo": "Diseño"
      },
      "asignado": {                           // ✅ Debe existir
        "uid": "...",
        "nombre_completo": "Carlos López - Diseñador",
        "correo": "carlos.diseno@empresa.com"
      },
      "fecha_resolucion": "2025-10-17T...",
      "costo": 30000
    }
  ]
}
```

---

## 🔍 Diagnóstico Si No Aparece

### Caso 1: Sigue mostrando "N/A"

**Posibles causas:**
1. El backend no reinició automáticamente
2. La petición no tiene usuario asignado (`asignado_a` es `null`)
3. Caché del navegador

**Solución:**
```bash
# 1. Reiniciar backend
cd Backend
npm run dev

# 2. Verificar datos de prueba
npm run init-data

# 3. Refrescar navegador
Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

---

### Caso 2: Error en consola del navegador

**Error esperado:**
```
Cannot read property 'nombre_completo' of undefined
```

**Causa:** La petición no tiene usuario asignado (peticiones pendientes).

**Verificación:**
- Solo las peticiones **RESUELTAS** deben tener usuario asignado
- Las peticiones **PENDIENTES** tienen `asignado_a = null`
- El frontend debe mostrar "N/A" con el operador `||`

---

### Caso 3: Backend no devuelve el usuario

**Verificar que existe la relación:**
```typescript
// Backend/src/models/Relaciones.ts
Peticion.belongsTo(Usuario, {
  foreignKey: "asignado_a",
  as: "asignado",
});
```

**Verificar que se importó el modelo:**
```typescript
// Backend/src/services/facturacion.service.ts
import Usuario from "../models/Usuario";
```

---

## 📝 Notas Técnicas

### Por qué usamos "asignado" y no "usuario_resolvio"

1. **Modelo:** El campo en la base de datos es `asignado_a` (tipo: number)
2. **Relación:** En `Relaciones.ts` se define como `as: "asignado"`
3. **Sequelize:** Al hacer `include`, usa el alias definido en la relación
4. **Convención:** Sequelize usa el `as` para nombrar el objeto anidado

### Campos devueltos del Usuario

Se seleccionaron solo los campos necesarios para optimizar:
```typescript
attributes: ["uid", "nombre_completo", "correo"]
```

**No se incluyen:**
- `contrasena` (por seguridad)
- `rol_id`, `area_id` (no necesarios en este contexto)
- `status`, `fecha_creacion` (irrelevantes)

### Peticiones sin usuario

Las peticiones **PENDIENTES** no tienen usuario asignado:
- `asignado_a = null` en la base de datos
- `asignado = null` en la respuesta del API
- Frontend muestra "N/A" con el operador `||`

---

## 📁 Resumen de Archivos Modificados

### Backend (1 archivo)
1. ✅ `Backend/src/services/facturacion.service.ts`
   - Importado modelo `Usuario`
   - Agregado `include` en consulta de peticiones activas
   - Agregado `include` en consulta de peticiones históricas

### Frontend (2 archivos)
2. ✅ `Front/.../detalle-facturacion.component.html`
   - Cambiado `usuario_resolvio` → `asignado`

3. ✅ `Front/.../detalle-facturacion.component.ts`
   - Cambiado `usuario_resolvio` → `asignado` en método `exportarPDF()`

---

## ✅ Checklist de Verificación

- [x] Backend incluye relación con Usuario
- [x] Frontend HTML usa campo correcto
- [x] Frontend PDF usa campo correcto
- [x] Modelo Usuario importado en servicio
- [x] Relación "asignado" existe en Relaciones.ts
- [ ] Backend reiniciado (automático con esbuild)
- [ ] Navegador refrescado (PENDIENTE - Usuario)
- [ ] Verificar vista web (PENDIENTE - Usuario)
- [ ] Verificar PDF exportado (PENDIENTE - Usuario)

---

## 🎉 Resultado Final

Ahora en el **Detalle de Facturación**, la tabla de peticiones muestra:
- ✅ ID de la petición
- ✅ Nombre de la categoría
- ✅ **Nombre completo del usuario que resolvió** (nuevo)
- ✅ Fecha de resolución
- ✅ Costo

Y en el **PDF exportado**:
- ✅ Misma información completa
- ✅ Usuario visible en cada petición

---

**Fecha de corrección:** 17 de octubre de 2025  
**Desarrollador:** GitHub Copilot  
**Estado:** ✅ Corrección completa - Requiere refresh de navegador
