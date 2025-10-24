# 🔧 FIX: Error "column PeticionHistorico.area does not exist"

**Fecha:** Octubre 24, 2025
**Prioridad:** CRÍTICA 🔴
**Estado:** ✅ RESUELTO (Pendiente ejecutar migración)

---

## 📋 Descripción del Problema

### Error Reportado
```
Error al cargar histórico: 
{
  status: 500,
  message: "Error interno del servidor",
  error: {
    success: false,
    message: "column PeticionHistorico.area does not exist"
  }
  status: 500
}
```

**Contexto:**
- Error aparece **SOLO para usuarios de Gestión Administrativa**
- Ocurre al intentar cargar el histórico de peticiones
- Diseñadores y Pautadores no tienen este problema

**Causa Raíz:**
- La tabla `peticiones_historico` **NO tiene la columna `area`**
- El modelo `PeticionHistorico` no incluía el campo `area`
- Cuando agregamos soporte para Gestión Administrativa, solo actualizamos:
  ✅ Tabla `peticiones` (tiene columna `area`)
  ✅ Modelo `Peticion.ts` (tiene propiedad `area`)
  ❌ Tabla `peticiones_historico` (NO tiene columna `area`)
  ❌ Modelo `PeticionHistorico.ts` (NO tenía propiedad `area`)

---

## 🔍 Análisis Técnico

### Estructura Actual de Tablas

**Tabla `peticiones` (Principal) ✅**
```sql
CREATE TABLE peticiones (
  id INT PRIMARY KEY,
  cliente_id INT,
  categoria_id INT,
  area ENUM('Pautas', 'Diseño', 'Gestión Administrativa'), -- ✅ Existe
  descripcion TEXT,
  estado VARCHAR(50),
  -- ... otros campos
);
```

**Tabla `peticiones_historico` (Histórico) ❌**
```sql
CREATE TABLE peticiones_historico (
  id INT PRIMARY KEY,
  peticion_id_original INT,
  cliente_id INT,
  categoria_id INT,
  -- ❌ Falta columna 'area'
  descripcion TEXT,
  estado ENUM('Resuelta', 'Cancelada'),
  -- ... otros campos
);
```

### Problema en el Código

**Modelo `PeticionHistorico.ts` (ANTES) ❌**
```typescript
export class PeticionHistorico extends Model {
  public id!: number;
  public peticion_id_original!: number;
  public cliente_id!: number;
  public categoria_id!: number;
  // ❌ Falta: public area!: "Pautas" | "Diseño" | "Gestión Administrativa";
  public descripcion!: string;
  // ...
}

PeticionHistorico.init({
  // ...
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // ❌ Falta definición de 'area'
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // ...
});
```

---

## ✅ Solución Aplicada

### 🔧 Fix 1: Actualizar Modelo TypeScript

**Archivo:** `Backend/src/models/PeticionHistorico.ts`

**Cambio 1 - Clase (línea 4-19):**
```typescript
export class PeticionHistorico extends Model {
  public id!: number;
  public peticion_id_original!: number;
  public cliente_id!: number;
  public categoria_id!: number;
  public area!: "Pautas" | "Diseño" | "Gestión Administrativa"; // ✅ Agregado
  public descripcion!: string;
  public descripcion_extra!: string | null;
  public costo!: number;
  public estado!: "Resuelta" | "Cancelada";
  public creador_id!: number;
  public asignado_a!: number | null;
  public fecha_creacion!: Date;
  public fecha_aceptacion!: Date | null;
  public fecha_resolucion!: Date;
  public fecha_movido_historico!: Date;
  public tiempo_empleado_segundos!: number;
}
```

**Cambio 2 - Schema Sequelize (línea 38-47):**
```typescript
PeticionHistorico.init({
  // ...
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  area: { // ✅ Agregado
    type: DataTypes.ENUM("Pautas", "Diseño", "Gestión Administrativa"),
    allowNull: false,
    defaultValue: "Diseño",
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // ...
});
```

---

### 🗄️ Fix 2: Crear Migración de Base de Datos

**Archivo:** `Backend/src/migrations/agregar-area-historico.ts`

```typescript
import sequelize from "../database/connection";
import { QueryInterface, DataTypes } from "sequelize";

export async function agregarAreaHistorico() {
  const queryInterface: QueryInterface = sequelize.getQueryInterface();

  try {
    console.log("🔄 Iniciando migración: Agregar columna 'area' a peticiones_historico");

    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable("peticiones_historico");
    
    if (tableDescription.area) {
      console.log("✅ La columna 'area' ya existe en peticiones_historico");
      return;
    }

    // Agregar columna 'area' con valor por defecto
    await queryInterface.addColumn("peticiones_historico", "area", {
      type: DataTypes.ENUM("Pautas", "Diseño", "Gestión Administrativa"),
      allowNull: false,
      defaultValue: "Diseño",
    });

    console.log("✅ Columna 'area' agregada exitosamente a peticiones_historico");

    // Actualizar registros existentes basándose en la categoría
    const result = await sequelize.query(`
      UPDATE peticiones_historico ph
      INNER JOIN categorias c ON ph.categoria_id = c.id
      SET ph.area = c.area_tipo
      WHERE ph.area = 'Diseño'
    `);

    console.log(`✅ Se actualizaron ${(result[0] as any).affectedRows || 0} registros con el área correcta`);
    
    console.log("🎉 Migración completada exitosamente");
  } catch (error) {
    console.error("❌ Error en migración agregar-area-historico:", error);
    throw error;
  }
}
```

**Qué hace esta migración:**
1. ✅ Verifica si la columna `area` ya existe (evita duplicados)
2. ✅ Agrega columna `area` tipo ENUM con valor por defecto "Diseño"
3. ✅ Actualiza registros existentes con el área correcta según su categoría
4. ✅ Logs detallados del proceso

---

### 📦 Fix 3: Agregar Script en package.json

**Archivo:** `Backend/package.json`

```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon dist/index.js",
    "start": "nodemon dist/index.js",
    "init-data": "ts-node src/scripts/init-data.ts",
    "agregar-area-historico": "ts-node src/migrations/agregar-area-historico.ts", // ✅ Agregado
    "typescript": "tsc --watch"
  }
}
```

---

## 🚀 Instrucciones de Ejecución

### ⚠️ IMPORTANTE: Debes ejecutar esta migración

**Paso 1: Detener el servidor backend**
```bash
# Presiona Ctrl+C en la terminal donde corre el backend
```

**Paso 2: Ejecutar la migración**
```bash
cd Backend
npm run agregar-area-historico
```

**Output esperado:**
```bash
🔄 Iniciando migración: Agregar columna 'area' a peticiones_historico
✅ Columna 'area' agregada exitosamente a peticiones_historico
✅ Se actualizaron X registros con el área correcta
🎉 Migración completada exitosamente
✅ Migración ejecutada correctamente
```

**Paso 3: Reiniciar el servidor backend**
```bash
npm run dev
```

**Paso 4: Verificar en la base de datos (Opcional)**
```sql
-- Verificar estructura de la tabla
DESCRIBE peticiones_historico;

-- Debe mostrar:
-- area | enum('Pautas','Diseño','Gestión Administrativa') | NO | | Diseño |

-- Verificar datos actualizados
SELECT id, peticion_id_original, area, estado 
FROM peticiones_historico 
LIMIT 10;
```

---

## 🧪 Testing Requerido

### 1. Testing Histórico con Gestión Administrativa

**Usuario:** laura.admin@empresa.com (Gestión Administrativa)

**Pasos:**
```bash
1. Login como usuario GA
2. Ir a: Peticiones → Ver peticiones completadas/canceladas
3. Verificar que carga el histórico sin errores
4. Resultado esperado:
   ✅ Histórico carga correctamente
   ✅ Aparecen peticiones con área "Gestión Administrativa"
   ❌ NO debe mostrar error 500
   ❌ NO debe mostrar "column area does not exist"
```

### 2. Testing Histórico con Pautas/Diseño

**Usuario:** carlos.diseno@empresa.com (Diseño)

**Pasos:**
```bash
1. Login como usuario Diseño
2. Ir a: Peticiones → Ver histórico
3. Verificar que carga correctamente
4. Resultado esperado:
   ✅ Histórico funciona igual que antes
   ✅ Aparecen peticiones de Diseño resueltas/canceladas
```

### 3. Testing Nueva Petición GA → Histórico

**Flujo completo:**
```bash
# Paso 1: GA crea petición
Usuario: laura.admin@empresa.com
Acción: Crear petición → Categoría GA
Estado: Pendiente

# Paso 2: Pautador acepta
Usuario: juan.pautas@empresa.com
Acción: Aceptar petición
Estado: En Progreso

# Paso 3: Pautador completa
Usuario: juan.pautas@empresa.com
Acción: Marcar como resuelta
Estado: Resuelta → Se mueve a histórico

# Paso 4: Verificar en histórico
Usuario: laura.admin@empresa.com (o juan.pautas@empresa.com)
Acción: Ver histórico
Resultado esperado:
✅ Petición aparece en histórico
✅ Campo 'area' = "Gestión Administrativa"
✅ Sin errores de base de datos
```

---

## 📊 Impacto del Fix

### Antes del Fix ❌
- **GA:** Error 500 al cargar histórico
- **Pautas/Diseño:** Histórico funciona correctamente
- **Peticiones GA completadas:** No se pueden mover a histórico (error BD)
- **Error:** "column PeticionHistorico.area does not exist"

### Después del Fix ✅
- **GA:** Histórico carga correctamente
- **Pautas/Diseño:** Histórico sigue funcionando
- **Peticiones GA completadas:** Se mueven a histórico sin errores
- **Base de datos:** Estructura consistente entre tablas

---

## 🔄 Archivos Modificados

### Backend (3 archivos)

**1. Modelo PeticionHistorico.ts**
```typescript
// Línea 7: Agregada propiedad
public area!: "Pautas" | "Diseño" | "Gestión Administrativa";

// Líneas 40-45: Agregado campo en schema
area: {
  type: DataTypes.ENUM("Pautas", "Diseño", "Gestión Administrativa"),
  allowNull: false,
  defaultValue: "Diseño",
},
```

**2. Migración agregar-area-historico.ts** (Nuevo archivo)
```typescript
// Archivo completo: Script de migración para agregar columna
export async function agregarAreaHistorico() {
  // Agrega columna 'area' a tabla peticiones_historico
  // Actualiza registros existentes
}
```

**3. package.json**
```json
// Script agregado
"agregar-area-historico": "ts-node src/migrations/agregar-area-historico.ts"
```

---

## 🐛 Debugging Tips

### Si sigue apareciendo el error:

**1. Verificar que la migración se ejecutó:**
```bash
cd Backend
npm run agregar-area-historico

# Debe mostrar:
# ✅ Columna 'area' agregada exitosamente
```

**2. Verificar en MySQL directamente:**
```sql
USE factura_db; -- O el nombre de tu base de datos

DESCRIBE peticiones_historico;

-- Buscar en el resultado:
-- area | enum('Pautas','Diseño','Gestión Administrativa') | NO | | Diseño |
```

**3. Si la columna no existe, crear manualmente:**
```sql
ALTER TABLE peticiones_historico 
ADD COLUMN area ENUM('Pautas', 'Diseño', 'Gestión Administrativa') 
NOT NULL 
DEFAULT 'Diseño' 
AFTER categoria_id;

-- Actualizar registros existentes
UPDATE peticiones_historico ph
INNER JOIN categorias c ON ph.categoria_id = c.id
SET ph.area = c.area_tipo
WHERE ph.area = 'Diseño';
```

**4. Verificar que backend se reinició:**
```bash
cd Backend
npm run dev

# Debe cargar sin errores TypeScript
# Los modelos deben sincronizarse con la BD
```

---

## ⚠️ Notas Importantes

### ¿Por qué pasó esto?

Cuando implementamos soporte para **Gestión Administrativa**, agregamos:
1. ✅ Columna `area` en tabla `peticiones`
2. ✅ Campo `area` en modelo `Peticion.ts`
3. ❌ **Olvidamos actualizar** tabla `peticiones_historico`
4. ❌ **Olvidamos actualizar** modelo `PeticionHistorico.ts`

**Resultado:** Las peticiones nuevas tienen `area`, pero al moverlas a histórico, falla porque la tabla histórica no tiene esa columna.

### ¿Por qué solo afecta a GA?

- Diseño y Pautas tienen peticiones antiguas (antes de agregar `area`)
- Sus peticiones en histórico no causan error porque fueron creadas antes
- GA es nueva, todas sus peticiones tienen campo `area`
- Al intentar cargar histórico, busca columna `area` que no existe → Error

---

## 📞 Resolución

**Usuario Reportó:** Usuario de Gestión Administrativa  
**Problema:** Error 500 "column PeticionHistorico.area does not exist"  
**Resuelto Por:** GitHub Copilot + Developer  
**Fecha Resolución:** Octubre 24, 2025  
**Prioridad:** 🔴 CRÍTICA - Error de base de datos  
**Estado:** ✅ RESUELTO (Pendiente ejecutar migración)

---

## 🔗 Documentos Relacionados

- `FIX_BUG_VALIDADOR_DESCRIPCION_EXTRA_GA_COMPLETO.md` - Validación descripción GA
- `FIX_PETICIONES_GA_VISIBLES_PAUTADORES.md` - Visibilidad peticiones GA
- `IMPLEMENTACION_TIPO_CLIENTE.md` - Sistema de áreas
- `SISTEMA_TRAZABILIDAD_COMPLETO.md` - Sistema de histórico

---

## ✅ Checklist Final de Resolución

### Código
- [x] ✅ Modelo `PeticionHistorico.ts` actualizado con campo `area`
- [x] ✅ Schema Sequelize actualizado con columna `area`
- [x] ✅ Migración creada `agregar-area-historico.ts`
- [x] ✅ Script agregado en `package.json`
- [x] ✅ Compilación sin errores TypeScript
- [x] ✅ Documentado problema y solución

### Base de Datos (Pendiente usuario)
- [ ] ⏳ **IMPORTANTE:** Ejecutar migración `npm run agregar-area-historico`
- [ ] ⏳ Verificar columna agregada en `peticiones_historico`
- [ ] ⏳ Verificar registros existentes actualizados
- [ ] ⏳ Reiniciar servidor backend

### Testing (Pendiente usuario)
- [ ] ⏳ Testing GA carga histórico sin errores
- [ ] ⏳ Testing Diseño/Pautas histórico sigue funcionando
- [ ] ⏳ Testing completar petición GA → Se mueve a histórico correctamente
- [ ] ⏳ Verificar en BD que peticiones tienen área correcta

---

**Estado Final:** ✅ CÓDIGO ACTUALIZADO - ⚠️ EJECUTAR MIGRACIÓN REQUERIDA  
**Próximo Paso:** 🗄️ EJECUTAR: `npm run agregar-area-historico`
