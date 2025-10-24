# 🔧 FIX: Categorías de Gestión Administrativa mostrando precio incorrecto

## 🎯 Problema Identificado

El usuario reporta que las categorías de **Gestión Administrativa** están mostrando un costo de **$60.000** en el frontend, cuando deberían mostrar **$0** (costo cero).

### Evidencia del Problema:
```
📸 Screenshot muestra:
Área: Gestión Administrativa
Costo: $ 60.000  ← ❌ INCORRECTO
```

### Causa Raíz:
La base de datos tiene categorías de Gestión Administrativa con costos diferentes de 0, probablemente creadas antes de la última actualización del `init-data.ts`.

---

## ✅ Verificaciones Realizadas

### 1. Backend - Modelo Categoria ✅
```typescript
// Backend/src/models/Categoria.ts

export class Categoria extends Model {
  public id!: number;
  public nombre!: string;
  public area_tipo!: "Diseño" | "Pautas" | "Gestión Administrativa";
  public costo!: number; // ← Campo existe
  public es_variable!: boolean;
  public requiere_descripcion_extra!: boolean;
}
```
**Estado**: ✅ Correcto - El modelo tiene el campo `costo`

### 2. Backend - Init-Data ✅
```typescript
// Backend/src/scripts/init-data.ts (líneas 303-371)

const categoriasGestionAdmin = [
  {
    nombre: "Reporte de problema - Cliente",
    area_tipo: "Gestión Administrativa",
    costo: 0, // ← ✅ COSTO 0
    es_variable: false,
    requiere_descripcion_extra: true,
  },
  {
    nombre: "Solicitud de soporte técnico",
    area_tipo: "Gestión Administrativa",
    costo: 0, // ← ✅ COSTO 0
    es_variable: false,
    requiere_descripcion_extra: true,
  },
  // ... 6 categorías más, todas con costo: 0
];
```
**Estado**: ✅ Correcto - Todas las categorías de GA tienen `costo: 0`

### 3. Backend - API Endpoint ✅
```typescript
// Backend/src/controllers/categoria.controller.ts
// Backend/src/services/categoria.service.ts

async obtenerPorArea(area: string): Promise<Categoria[]> {
  const categorias = await Categoria.findAll({
    where: { area_tipo: area },
    order: [["nombre", "ASC"]],
  });
  return categorias;
}
```
**Estado**: ✅ Correcto - Retorna todas las categorías con todos los campos

### 4. Frontend - Servicio ✅
```typescript
// Front/src/app/core/services/categoria.service.ts

getByArea(area: AreaTipo): Observable<Categoria[]> {
  return this.http.get<{ success: boolean; data: Categoria[] }>(
    `${this.apiUrl}/area/${area}`
  ).pipe(map(response => response.data));
}
```
**Estado**: ✅ Correcto - Consume la API correctamente

### 5. Frontend - Constantes Eliminadas ✅
```bash
# Búsqueda en todos los archivos:
grep -r "categorias.constants" Front/src/**/*.ts
# Resultado: No matches found
```
**Estado**: ✅ Correcto - Ya no se usan constantes hardcodeadas

### 6. Frontend - HTML Mostrando Costo ✅
```html
<!-- crear-peticion.component.html (línea 156) -->

<div class="info-item">
  <span class="info-label">Costo:</span>
  <span class="info-value highlight">{{
    categoriaSeleccionada.costo | currencyCop
  }}</span>
</div>
```
**Estado**: ✅ Correcto - Muestra el costo que viene del backend

---

## 🔍 Diagnóstico Final

**El problema NO está en el código, está en los DATOS de la base de datos.**

La base de datos actual tiene categorías de Gestión Administrativa creadas con costos incorrectos (ej: $60.000). El `init-data.ts` crea categorías con `costo: 0`, pero si ya existen en la BD, el método `findOrCreate` NO las actualiza.

```typescript
// init-data.ts usa findOrCreate
await Categoria.findOrCreate({
  where: { nombre: cat.nombre },
  defaults: cat, // ← Solo se usa si NO existe
});
```

Si la categoría ya existe con `costo: 60000`, **NO se actualiza a 0**.

---

## 🛠️ SOLUCIÓN 1: Script de Actualización (RECOMENDADA)

He creado un script específico para actualizar SOLO las categorías de Gestión Administrativa:

```typescript
// Backend/src/scripts/actualizar-categorias-ga.ts

import sequelize from "../database/connection";
import Categoria from "../models/Categoria";
import "../models/Relaciones";

async function actualizarCategoriasGA() {
  try {
    console.log("🔄 Actualizando categorías de Gestión Administrativa...");

    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Actualizar TODAS las categorías de GA para que tengan costo 0
    const [affectedCount] = await Categoria.update(
      { costo: 0 },
      {
        where: {
          area_tipo: "Gestión Administrativa",
        },
      }
    );

    console.log(`✅ Se actualizaron ${affectedCount} categorías de Gestión Administrativa`);
    console.log("   Todas las categorías de GA ahora tienen costo: $0");

    // Mostrar las categorías actualizadas
    const categoriasGA = await Categoria.findAll({
      where: { area_tipo: "Gestión Administrativa" },
      attributes: ["id", "nombre", "costo", "area_tipo"],
      order: [["nombre", "ASC"]],
    });

    console.log("\n📋 Categorías de Gestión Administrativa:");
    categoriasGA.forEach((cat) => {
      console.log(`   • ${cat.nombre} - Costo: $${cat.costo}`);
    });

    await sequelize.close();
    console.log("\n✅ Actualización completada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al actualizar categorías:", error);
    await sequelize.close();
    process.exit(1);
  }
}

actualizarCategoriasGA();
```

### Agregar script al package.json:

```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon dist/index.js",
    "start": "nodemon dist/index.js",
    "init-data": "ts-node src/scripts/init-data.ts",
    "actualizar-categorias-ga": "ts-node src/scripts/actualizar-categorias-ga.ts",
    "typescript": "tsc --watch"
  }
}
```

### Ejecutar el script:

```bash
cd Backend
npm run actualizar-categorias-ga
```

**Resultado esperado**:
```
🔄 Actualizando categorías de Gestión Administrativa...
✅ Conectado a la base de datos
✅ Se actualizaron 8 categorías de Gestión Administrativa
   Todas las categorías de GA ahora tienen costo: $0

📋 Categorías de Gestión Administrativa:
   • Consulta general del cliente - Costo: $0
   • Escalamiento de caso - Costo: $0
   • Incidencia con campaña - Costo: $0
   • Otro - Especificar - Costo: $0
   • Problema con diseño web - Costo: $0
   • Reporte de problema - Cliente - Costo: $0
   • Seguimiento de solicitud - Costo: $0
   • Solicitud de soporte técnico - Costo: $0

✅ Actualización completada exitosamente
```

---

## 🛠️ SOLUCIÓN 2: Resetear Base de Datos Completa

Si prefieres empezar desde cero (esto BORRARÁ todos los datos):

### Opción A: Modificar server.ts temporalmente

```typescript
// Backend/src/models/server.ts (línea 43)

// CAMBIAR TEMPORALMENTE:
await sequelize.sync({ alter: false }); // ← De esto
await sequelize.sync({ force: true });  // ← A esto (UNA SOLA VEZ)
```

**Luego ejecutar**:
```bash
cd Backend
npm run dev  # Esto reseteará la BD
# Presionar Ctrl+C
# Volver a cambiar force: true → alter: false
npm run init-data  # Crear datos de prueba
npm run dev  # Iniciar servidor normal
```

### Opción B: Eliminar tabla manualmente

```sql
-- Conectarse a PostgreSQL
psql -U postgres -d nombre_de_tu_base_de_datos

-- Eliminar SOLO la tabla de categorías
DROP TABLE IF EXISTS categorias CASCADE;

-- Salir
\q
```

**Luego ejecutar**:
```bash
cd Backend
npm run dev  # Esto creará la tabla de nuevo
# Presionar Ctrl+C
npm run init-data  # Crear datos
npm run dev  # Iniciar servidor
```

---

## 🛠️ SOLUCIÓN 3: Actualización Manual SQL

Si prefieres ejecutar SQL directamente:

```sql
-- Conectarse a PostgreSQL
psql -U postgres -d nombre_de_tu_base_de_datos

-- Actualizar todas las categorías de Gestión Administrativa
UPDATE categorias 
SET costo = 0 
WHERE area_tipo = 'Gestión Administrativa';

-- Verificar el cambio
SELECT id, nombre, area_tipo, costo 
FROM categorias 
WHERE area_tipo = 'Gestión Administrativa'
ORDER BY nombre;

-- Salir
\q
```

---

## ✅ Verificación Post-Fix

Después de aplicar cualquiera de las soluciones:

### 1. Backend - Verificar API:
```bash
# Ejecutar en terminal o navegador:
curl http://localhost:3010/api/categorias/area/Gestión%20Administrativa

# O en navegador:
http://localhost:3010/api/categorias/area/Gestión%20Administrativa
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": [
    {
      "id": 32,
      "nombre": "Reporte de problema - Cliente",
      "area_tipo": "Gestión Administrativa",
      "costo": "0.00",  ← ✅ DEBE SER 0
      "es_variable": false,
      "requiere_descripcion_extra": true
    },
    // ... más categorías
  ],
  "message": "Categorías del área Gestión Administrativa obtenidas exitosamente"
}
```

### 2. Frontend - Verificar Vista:
```bash
# 1. Iniciar Frontend
cd Front
ng serve

# 2. Login con usuario de GA
Usuario: laura.admin@empresa.com
Password: 123456

# 3. Ir a Crear Petición
Peticiones → Crear Nueva

# 4. Seleccionar categoría
Área: Gestión Administrativa (bloqueada)
Categoría: "Actualización de base de datos"

# 5. Verificar costo mostrado
✅ Debe mostrar: Costo: $ 0
❌ NO debe mostrar: Costo: $ 60.000
```

### 3. Consola del Navegador:
```javascript
// Abrir DevTools (F12) → Console
// Buscar logs del servicio:
📦 Categorías cargadas desde backend: 8
✅ Categorías filtradas para "Gestión Administrativa": 8
📋 Categorías: [
  "Consulta general del cliente",
  "Escalamiento de caso",
  "Incidencia con campaña",
  "Otro - Especificar",
  "Problema con diseño web",
  "Reporte de problema - Cliente",
  "Seguimiento de solicitud",
  "Solicitud de soporte técnico"
]
```

---

## 📊 Comparación de Soluciones

| Solución | Velocidad | Riesgo | Datos Perdidos | Recomendada |
|----------|-----------|--------|----------------|-------------|
| **Script actualizar-categorias-ga** | ⚡ Rápida (5s) | 🟢 Bajo | ❌ Ninguno | ✅ **SÍ** |
| **Resetear BD completa** | ⏱️ Media (30s) | 🟡 Medio | ⚠️ Todos | ❌ No |
| **SQL Manual** | ⚡ Rápida (10s) | 🟢 Bajo | ❌ Ninguno | ✅ Sí |

---

## 🚀 Pasos Recomendados (EN ORDEN)

### Paso 1: Ejecutar Script de Actualización
```bash
cd c:\Users\DESARROLLO\Documents\Codigos\Factura\Backend
npm run actualizar-categorias-ga
```

### Paso 2: Verificar Backend API
```bash
# Iniciar backend (si no está corriendo)
npm run dev

# En navegador:
http://localhost:3010/api/categorias/area/Gestión%20Administrativa
```

### Paso 3: Verificar Frontend
```bash
# Terminal 2 - Frontend
cd c:\Users\DESARROLLO\Documents\Codigos\Factura\Front
ng serve

# Navegador:
http://localhost:4200
# Login: laura.admin@empresa.com / 123456
# Ir a: Peticiones → Crear Nueva
# Seleccionar categoría y verificar costo: $0
```

---

## 📝 Notas Importantes

1. **El código está correcto**: Frontend y backend están bien implementados
2. **El problema es DATA**: La BD tiene datos viejos con costos incorrectos
3. **Constantes eliminadas**: Ya no se usan archivos hardcodeados
4. **API funcionando**: El endpoint retorna correctamente los datos de la BD
5. **Solución segura**: El script solo actualiza categorías de GA, no afecta otras áreas

---

## ✅ Resultado Final Esperado

```
┌─────────────────────────────────────────────────────┐
│  Creando petición para el área de                  │
│  Gestión Administrativa                             │
├─────────────────────────────────────────────────────┤
│  📋 Seleccionar Categoría *                         │
│  [Actualización de base de datos        ▼]         │
│                                                     │
│  🏷️ Actualización de base de datos                 │
│  ┌───────────────────────────────────────────────┐ │
│  │ Área:  Gestión Administrativa                 │ │
│  │ Costo: $ 0  ← ✅ CORRECTO                      │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 📄 Archivos Creados

1. **`Backend/src/scripts/actualizar-categorias-ga.ts`** - Script de actualización
2. **`FIX_CATEGORIAS_COSTO_GA.md`** - Este documento (documentación completa)

---

**¡Con esto quedarán actualizadas todas las categorías de Gestión Administrativa con costo $0!** 🎉
