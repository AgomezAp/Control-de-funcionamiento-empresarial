# Feature: Campo Cédula/NIT para Clientes

## 📋 Resumen

Se agregó el campo **`cedula`** al modelo de Cliente para permitir el registro de documentos de identidad (cédulas, NIT, CIF, etc.) de los clientes. Este campo es **opcional** y **único** en toda la base de datos.

---

## 🎯 Objetivo

Permitir identificar a los clientes por su documento oficial (cédula, NIT, pasaporte, etc.) para facilitar:
- Búsquedas por documento
- Identificación única de clientes
- Cumplimiento de requisitos legales/contables
- Prevención de duplicados

---

## 🔧 Cambios Implementados

### Backend

#### 1. Modelo Cliente (`Backend/src/models/Cliente.ts`)

**Cambios:**
```typescript
export class Cliente extends Model {
  public id!: number;
  public nombre!: string;
  public cedula!: string; // ✅ NUEVO CAMPO
  public pais!: string;
  // ... resto de campos
}

// Definición del campo en Sequelize:
cedula: {
  type: DataTypes.STRING(50),
  allowNull: true,          // Campo opcional
  unique: true,             // No permite duplicados
  comment: "Cédula o documento de identidad del cliente"
}
```

**Características:**
- **Tipo:** `STRING(50)` - Permite hasta 50 caracteres
- **Nullable:** `true` - Campo opcional, puede ser NULL
- **Unique:** `true` - No permite cédulas duplicadas
- **Validación:** Alfanumérico + guiones (ver validadores)

#### 2. Validadores (`Backend/src/validators/cliente.validator.ts`)

**Validación al crear cliente:**
```typescript
body("cedula")
  .optional({ nullable: true, checkFalsy: true })
  .trim()
  .isLength({ min: 5, max: 50 })
  .withMessage("La cédula debe tener entre 5 y 50 caracteres")
  .matches(/^[a-zA-Z0-9\-]+$/)
  .withMessage("La cédula solo puede contener letras, números y guiones")
```

**Validación al actualizar cliente:**
- Mismas reglas que al crear
- Campo sigue siendo opcional

**Reglas:**
- ✅ Longitud: 5-50 caracteres
- ✅ Formato: Solo letras, números y guiones
- ✅ Opcional: Puede enviarse vacío o NULL
- ✅ Unique: Backend valida duplicados automáticamente

#### 3. Datos de Prueba (`Backend/src/scripts/init-data.ts`)

**Clientes creados con cédula:**
```typescript
{
  nombre: "Empresa Tech Solutions",
  cedula: "900123456-7",        // Formato Colombia (NIT)
  pais: "Colombia",
  // ...
}
{
  nombre: "Comercial El Progreso",
  cedula: "MEX987654321",       // Formato México (RFC)
  pais: "México",
  // ...
}
{
  nombre: "Restaurante La Buena Mesa",
  cedula: "900234567-8",        // Formato Colombia (NIT)
  pais: "Colombia",
  // ...
}
{
  nombre: "Tienda Fashion Style",
  cedula: "B12345678",          // Formato España (CIF)
  pais: "España",
  // ...
}
{
  nombre: "Consultora Legal Asociados",
  cedula: "20-30567891-4",      // Formato Argentina (CUIT)
  pais: "Argentina",
  // ...
}
```

---

### Frontend

#### 4. Modelo TypeScript (`Front/src/app/core/models/cliente.model.ts`)

**Cambios en interfaces:**
```typescript
export interface Cliente {
  id: number;
  nombre: string;
  cedula?: string;  // ✅ NUEVO - Opcional
  pais: string;
  // ... resto de campos
}

export interface ClienteCreate {
  nombre: string;
  cedula?: string;  // ✅ NUEVO - Opcional
  pais: string;
  // ... resto de campos
}

export interface ClienteUpdate {
  nombre?: string;
  cedula?: string;  // ✅ NUEVO - Opcional
  pais?: string;
  // ... resto de campos
}
```

#### 5. Formulario Crear Cliente

**Archivo:** `Front/src/app/features/clientes/components/crear-cliente/crear-cliente.component.ts`

**FormControl:**
```typescript
this.clienteForm = this.fb.group({
  nombre: ['', [Validators.required, Validators.minLength(3)]],
  cedula: ['', [
    Validators.minLength(5),
    Validators.maxLength(50),
    Validators.pattern(/^[a-zA-Z0-9\-]+$/)
  ]],
  pais: ['', Validators.required],
  // ... resto de campos
});
```

**Template HTML:**
```html
<div class="field">
  <label for="cedula">Cédula/NIT</label>
  <input
    id="cedula"
    type="text"
    pInputText
    formControlName="cedula"
    placeholder="Ej: 900123456-7, B12345678"
  />
  
  <!-- Validaciones -->
  <small class="p-error" *ngIf="clienteForm.get('cedula')?.hasError('minlength')">
    La cédula debe tener al menos 5 caracteres
  </small>
  <small class="p-error" *ngIf="clienteForm.get('cedula')?.hasError('maxlength')">
    La cédula no puede exceder 50 caracteres
  </small>
  <small class="p-error" *ngIf="clienteForm.get('cedula')?.hasError('pattern')">
    La cédula solo puede contener letras, números y guiones
  </small>
</div>
```

#### 6. Formulario Editar Cliente

**Archivo:** `Front/src/app/features/clientes/components/editar-cliente/editar-cliente.component.ts`

- Misma estructura que el formulario de creación
- FormControl con las mismas validaciones
- Template HTML idéntico

#### 7. Lista de Clientes

**Archivo:** `Front/src/app/features/clientes/components/lista-clientes/lista-clientes.component.html`

**Cambios en tabla:**
```html
<!-- Header -->
<th class="col-cedula">Cédula/NIT</th>

<!-- Body -->
<td class="col-cedula">
  <span class="cedula-text">{{ cliente.cedula || 'N/A' }}</span>
</td>
```

**Búsqueda global actualizada:**
```html
<p-table
  [globalFilterFields]="['nombre', 'cedula', 'pais', 'area']"
  <!-- ... resto de configuración -->
>
```

**Funcionalidad:**
- ✅ Columna visible en tabla
- ✅ Muestra "N/A" si no tiene cédula
- ✅ Incluida en búsqueda global

#### 8. Detalle de Cliente

**Archivo:** `Front/src/app/features/clientes/components/detalle-cliente/detalle-cliente.component.html`

**Campo agregado:**
```html
<!-- Cédula/NIT -->
<div class="info-card">
  <label class="info-label">
    <i class="pi pi-id-card"></i>
    Cédula/NIT
  </label>
  <p class="info-value">{{ cliente.cedula || 'No especificado' }}</p>
</div>
```

---

## 📁 Archivos Modificados

### Backend (6 archivos)
1. ✅ `Backend/src/models/Cliente.ts` - Definición del campo
2. ✅ `Backend/src/validators/cliente.validator.ts` - Validaciones crear y actualizar
3. ✅ `Backend/src/scripts/init-data.ts` - Datos de prueba con cédulas

### Frontend (8 archivos)
4. ✅ `Front/src/app/core/models/cliente.model.ts` - Interfaces TypeScript
5. ✅ `Front/src/app/features/clientes/components/crear-cliente/crear-cliente.component.ts` - FormControl
6. ✅ `Front/src/app/features/clientes/components/crear-cliente/crear-cliente.component.html` - Input cédula
7. ✅ `Front/src/app/features/clientes/components/editar-cliente/editar-cliente.component.ts` - FormControl
8. ✅ `Front/src/app/features/clientes/components/editar-cliente/editar-cliente.component.html` - Input cédula
9. ✅ `Front/src/app/features/clientes/components/lista-clientes/lista-clientes.component.html` - Columna y búsqueda
10. ✅ `Front/src/app/features/clientes/components/detalle-cliente/detalle-cliente.component.html` - Visualización
11. ✅ `Front/src/app/features/clientes/components/detalle-cliente/detalle-cliente.component.html` - Tarjeta info

---

## 🧪 Pruebas Recomendadas

### 1. Migración de Base de Datos

**Comando:**
```bash
cd Backend
npm run init-data
```

**Verificación:**
```sql
-- Ver estructura de tabla
\d clientes

-- Ver clientes con cédula
SELECT id, nombre, cedula, pais FROM clientes;

-- Resultado esperado:
--  id |            nombre             |    cedula     |   pais
-- ----+-------------------------------+---------------+-----------
--   1 | Empresa Tech Solutions        | 900123456-7   | Colombia
--   2 | Comercial El Progreso         | MEX987654321  | México
--   3 | Restaurante La Buena Mesa     | 900234567-8   | Colombia
--   4 | Tienda Fashion Style          | B12345678     | España
--   5 | Consultora Legal Asociados    | 20-30567891-4 | Argentina
```

### 2. Crear Cliente con Cédula

**Pasos:**
1. Ir a "Clientes" → "Crear Cliente"
2. Llenar datos requeridos (nombre, país, tipo, fechas)
3. **Ingresar cédula:** `123456789-0`
4. Hacer clic en "Guardar"

**Resultado esperado:**
- ✅ Cliente creado exitosamente
- ✅ Cédula visible en lista de clientes
- ✅ Cédula visible en detalle de cliente

### 3. Validaciones de Formato

**Test 1: Cédula muy corta**
```
Input: "12"
Resultado: ❌ Error "La cédula debe tener al menos 5 caracteres"
```

**Test 2: Cédula con caracteres inválidos**
```
Input: "abc@123#"
Resultado: ❌ Error "La cédula solo puede contener letras, números y guiones"
```

**Test 3: Cédula muy larga**
```
Input: "12345678901234567890123456789012345678901234567890X"
Resultado: ❌ Error "La cédula no puede exceder 50 caracteres"
```

**Test 4: Cédula válida**
```
Input: "900123456-7"
Resultado: ✅ Acepta el valor
```

### 4. Validación de Duplicados

**Pasos:**
1. Crear cliente con cédula `900123456-7`
2. Intentar crear otro cliente con la misma cédula

**Resultado esperado:**
- ❌ Error del backend: "Ya existe un cliente con esta cédula"
- Backend devuelve status 400 o 409

### 5. Campo Opcional

**Pasos:**
1. Crear cliente SIN ingresar cédula
2. Guardar

**Resultado esperado:**
- ✅ Cliente creado exitosamente
- ✅ Campo cédula en DB es NULL
- ✅ Lista muestra "N/A"
- ✅ Detalle muestra "No especificado"

### 6. Búsqueda por Cédula

**Pasos:**
1. Ir a lista de clientes
2. En el buscador global escribir: `900123456`

**Resultado esperado:**
- ✅ Filtra y muestra solo clientes con esa cédula
- ✅ Búsqueda funciona con coincidencia parcial

### 7. Editar Cédula

**Pasos:**
1. Abrir cliente con cédula `900123456-7`
2. Hacer clic en "Editar"
3. Cambiar cédula a `999888777-6`
4. Guardar

**Resultado esperado:**
- ✅ Cédula actualizada
- ✅ Cambio visible en lista y detalle

---

## 📊 Ejemplos de Formatos por País

### Colombia (NIT)
```
900123456-7
830000000-1
```

### México (RFC)
```
MEX987654321
ABC123456XYZ
```

### España (CIF/NIF)
```
B12345678
A28000000
```

### Argentina (CUIT)
```
20-30567891-4
27-12345678-9
```

### Otros formatos aceptados
```
123456789
ABC-123-XYZ
12-3456-78
```

---

## ⚠️ Consideraciones Importantes

### 1. Campo Opcional
- ❌ NO es obligatorio
- ✅ Puede ser NULL
- ✅ Validaciones solo aplican SI se ingresa un valor

### 2. Unique Constraint
- ✅ Previene cédulas duplicadas
- ⚠️ NULL NO cuenta como duplicado (se permiten múltiples NULL)
- ⚠️ El error de duplicado viene del backend

### 3. Validación de Formato
- ✅ Solo alfanumérico + guiones
- ❌ NO permite: espacios, puntos, símbolos especiales
- ⚠️ Validación es case-sensitive

### 4. Migración de Datos Existentes
- Los clientes existentes tendrán `cedula = NULL`
- No es necesario actualizar clientes antiguos
- Se puede agregar cédula posteriormente mediante edición

---

## 🔄 Próximas Mejoras Sugeridas

### 1. Validación por País
```typescript
// Validar formato específico según país del cliente
if (pais === 'Colombia') {
  // Validar NIT colombiano
} else if (pais === 'México') {
  // Validar RFC mexicano
}
```

### 2. Formateo Automático
```typescript
// Auto-formatear cédula según país
formatearCedula(cedula: string, pais: string): string {
  if (pais === 'Colombia') {
    return cedula.replace(/(\d{9})(\d)/, '$1-$2');
  }
  return cedula;
}
```

### 3. Búsqueda Avanzada
- Filtro específico por cédula en tabla
- Búsqueda exacta vs parcial
- Validación de existencia antes de crear

### 4. Exportación
- Incluir cédula en exportación Excel/PDF
- Columna visible en reportes

---

## ✅ Checklist de Implementación

- [x] Modelo backend con campo cedula
- [x] Validadores backend (crear + actualizar)
- [x] Datos de prueba con cédulas
- [x] Interfaces TypeScript frontend
- [x] Formulario crear con validaciones
- [x] Formulario editar con validaciones
- [x] Columna en lista de clientes
- [x] Búsqueda global incluye cedula
- [x] Visualización en detalle de cliente
- [ ] Ejecutar `npm run init-data` (PENDIENTE)
- [ ] Probar crear cliente con cédula (PENDIENTE)
- [ ] Probar validaciones (PENDIENTE)
- [ ] Probar búsqueda por cédula (PENDIENTE)
- [ ] Documentar en guía de usuario (PENDIENTE)

---

## 📝 Notas de Desarrollo

### Decisiones Técnicas
1. **Campo opcional:** Permite migración gradual sin afectar clientes existentes
2. **Unique constraint:** Previene duplicados a nivel de BD
3. **Validación regex:** Acepta formatos internacionales variados
4. **Longitud 50:** Suficiente para la mayoría de documentos internacionales

### Problemas Conocidos
- ⚠️ Validación de formato no es específica por país (acepta cualquier formato alfanumérico)
- ⚠️ No hay formateo automático de cédula
- ⚠️ Unique constraint no valida en tiempo real en frontend (solo al enviar)

### Lecciones Aprendidas
- Campo opcional requiere validación condicional (.optional())
- Unique constraint a nivel de BD es más confiable que validación frontend
- Mostrar "N/A" o "No especificado" mejora UX para campos opcionales

---

**Fecha de implementación:** 2024  
**Desarrollador:** GitHub Copilot  
**Estado:** ✅ Implementación completa - Pendiente pruebas
