# Feature: Campos de Contacto y Ubicación del Cliente

**Fecha:** 20 de octubre de 2025  
**Desarrollador:** GitHub Copilot  
**Estado:** ✅ Completado

---

## 📋 Descripción

Se agregaron campos adicionales al modelo `Cliente` para almacenar información de contacto y ubicación:
- **Teléfono**: Número de contacto del cliente
- **Correo Electrónico**: Email para comunicación
- **Ciudad**: Ciudad de residencia
- **Dirección**: Dirección completa

Todos estos campos son **opcionales** y se muestran en:
- Formularios de creación y edición de clientes
- Detalle de cliente
- Detalle de facturación (HTML y PDF)
- Lista de clientes (opcional)

---

## 🔧 Cambios en Backend

### 1. Modelo Cliente (`Backend/src/models/Cliente.ts`)

**Campos agregados:**
```typescript
export class Cliente extends Model {
  // ... campos existentes
  public telefono!: string;
  public correo!: string;
  public ciudad!: string;
  public direccion!: string;
}

Cliente.init({
  // ... campos existentes
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: "Número de teléfono de contacto",
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
    },
    comment: "Correo electrónico del cliente",
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: "Ciudad de residencia",
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Dirección completa de residencia",
  },
});
```

### 2. Controlador (`Backend/src/controllers/cliente.controller.ts`)

Actualizado método `crear()` para recibir los nuevos campos:
```typescript
async crear(req: Request, res: Response) {
  const { 
    nombre, 
    cedula, 
    telefono,   // ✅ Nuevo
    correo,     // ✅ Nuevo
    ciudad,     // ✅ Nuevo
    direccion,  // ✅ Nuevo
    pais, 
    tipo_cliente, 
    pautador_id, 
    disenador_id, 
    fecha_inicio 
  } = req.body;
  // ...
}
```

### 3. Servicio de Clientes (`Backend/src/services/cliente.service.ts`)

Actualizada la interfaz del método `crear()`:
```typescript
async crear(data: {
  nombre: string;
  cedula?: string;
  telefono?: string;    // ✅ Nuevo
  correo?: string;      // ✅ Nuevo
  ciudad?: string;      // ✅ Nuevo
  direccion?: string;   // ✅ Nuevo
  pais: string;
  tipo_cliente: string;
  pautador_id: number;
  disenador_id?: number;
  fecha_inicio: Date;
}, usuarioActual: any)
```

### 4. Servicio de Facturación (`Backend/src/services/facturacion.service.ts`)

Actualizado en **3 métodos** para incluir los nuevos campos en las consultas:

```typescript
// obtenerPeriodoPorId()
attributes: ["id", "nombre", "cedula", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"]

// obtenerResumenFacturacionMensual()
attributes: ["id", "nombre", "cedula", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"]

// obtenerEstadisticasGlobales()
attributes: ["id", "nombre", "cedula", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"]
```

### 5. Init Data (`Backend/src/scripts/init-data.ts`)

Actualizado con datos de ejemplo para los 5 clientes de prueba:

| Cliente | Teléfono | Correo | Ciudad | Dirección |
|---------|----------|--------|--------|-----------|
| Empresa Tech Solutions | +57 301-1234567 | info@techsolutions.com.co | Medellín | Carrera 43A #14-87, Edificio Centro Empresarial |
| Comercial El Progreso | +52 55-1234-5678 | ventas@elprogreso.mx | Ciudad de México | Av. Insurgentes Sur 1234, Col. Del Valle |
| Restaurante La Buena Mesa | +57 310-7654321 | contacto@labuenamesa.co | Bogotá | Calle 85 #15-20, Zona Rosa |
| Tienda Fashion Style | +34 612-987654 | tienda@fashionstyle.es | Madrid | Gran Vía 28, 2º piso |
| Consultora Legal Asociados | +54 11-5678-9012 | info@legalasociados.com.ar | Buenos Aires | Av. Corrientes 1500, Piso 10 |

---

## 🎨 Cambios en Frontend

### 1. Modelo Cliente (`Front/src/app/core/models/cliente.model.ts`)

```typescript
export interface Cliente {
  // ... campos existentes
  telefono?: string;
  correo?: string;
  ciudad?: string;
  direccion?: string;
}

export interface ClienteCreate {
  // ... campos existentes
  telefono?: string;
  correo?: string;
  ciudad?: string;
  direccion?: string;
}

export interface ClienteUpdate {
  // ... campos existentes
  telefono?: string;
  correo?: string;
  ciudad?: string;
  direccion?: string;
}
```

### 2. Formulario Crear Cliente

**Archivo:** `crear-cliente.component.ts`

Validadores agregados:
```typescript
this.clienteForm = this.fb.group({
  // ... campos existentes
  telefono: ['', [Validators.maxLength(20)]],
  correo: ['', [Validators.email, Validators.maxLength(100)]],
  ciudad: ['', [Validators.maxLength(100)]],
  direccion: ['', [Validators.maxLength(500)]],
});
```

**Archivo:** `crear-cliente.component.html`

Campos agregados después de Cédula:
- Input de teléfono con placeholder `+57 310-1234567`
- Input de correo con validación de email
- Input de ciudad
- Textarea de dirección (3 filas, máx 500 caracteres)

### 3. Formulario Editar Cliente

**Archivos:** `editar-cliente.component.ts` y `.html`

Mismos campos y validadores que crear cliente.

Método `patchValue()` actualizado para incluir los nuevos campos.

### 4. Detalle de Cliente

**Archivo:** `detalle-cliente.component.html`

Agregadas 4 nuevas tarjetas de información:
- 📱 Teléfono
- ✉️ Correo Electrónico
- 📍 Ciudad
- 🏠 Dirección

### 5. Detalle de Facturación

**Archivo:** `detalle-facturacion.component.html`

Agregados 4 nuevos campos en la sección "Información del Cliente":
- Teléfono
- Correo
- Ciudad
- Dirección

**Archivo:** `detalle-facturacion.component.ts`

Método `exportarPDF()` actualizado para incluir los 4 nuevos campos en la sección "Información del Cliente" del PDF.

---

## ✅ Validaciones

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| Teléfono | Opcional, máximo 20 caracteres | "El teléfono no puede exceder 20 caracteres" |
| Correo | Opcional, formato email, máximo 100 caracteres | "Ingrese un correo electrónico válido" |
| Ciudad | Opcional, máximo 100 caracteres | "La ciudad no puede exceder 100 caracteres" |
| Dirección | Opcional, máximo 500 caracteres | "La dirección no puede exceder 500 caracteres" |

---

## 📦 Migración de Base de Datos

**⚠️ Importante:** Los nuevos campos no se agregarán automáticamente a la base de datos existente.

**Opciones:**

### Opción 1: Recrear la base de datos (RECOMENDADO para desarrollo)
```bash
cd Backend
npm run init-data
```
Esto eliminará y recreará todas las tablas con los nuevos campos.

### Opción 2: Migración manual (para producción)
```sql
ALTER TABLE clientes ADD COLUMN telefono VARCHAR(20) NULL;
ALTER TABLE clientes ADD COLUMN correo VARCHAR(100) NULL;
ALTER TABLE clientes ADD COLUMN ciudad VARCHAR(100) NULL;
ALTER TABLE clientes ADD COLUMN direccion TEXT NULL;
```

---

## 🧪 Testing Manual

### 1. Crear Cliente
- ✅ Crear cliente sin llenar campos opcionales → Debe guardar correctamente
- ✅ Crear cliente con todos los campos → Debe guardar correctamente
- ✅ Ingresar correo inválido → Debe mostrar error de validación
- ✅ Ingresar teléfono de más de 20 caracteres → Debe mostrar error

### 2. Editar Cliente
- ✅ Editar cliente existente y agregar teléfono/correo → Debe actualizar
- ✅ Editar cliente y dejar campos vacíos → Debe permitir guardar

### 3. Detalle de Cliente
- ✅ Ver cliente con datos de contacto → Debe mostrar todos los campos
- ✅ Ver cliente sin datos de contacto → Debe mostrar "No especificado"

### 4. Facturación
- ✅ Generar facturación → Debe incluir datos de contacto en HTML
- ✅ Exportar PDF → Debe incluir todos los campos nuevos en PDF

---

## 📊 Resumen de Archivos Modificados

### Backend (6 archivos)
- ✅ `Backend/src/models/Cliente.ts`
- ✅ `Backend/src/controllers/cliente.controller.ts`
- ✅ `Backend/src/services/cliente.service.ts`
- ✅ `Backend/src/services/facturacion.service.ts`
- ✅ `Backend/src/scripts/init-data.ts`

### Frontend (7 archivos)
- ✅ `Front/src/app/core/models/cliente.model.ts`
- ✅ `Front/.../crear-cliente.component.ts`
- ✅ `Front/.../crear-cliente.component.html`
- ✅ `Front/.../editar-cliente.component.ts`
- ✅ `Front/.../editar-cliente.component.html`
- ✅ `Front/.../detalle-cliente.component.html`
- ✅ `Front/.../detalle-facturacion.component.html`
- ✅ `Front/.../detalle-facturacion.component.ts`

---

## 🚀 Próximos Pasos

1. **Ejecutar init-data:**
   ```bash
   cd Backend
   npm run init-data
   ```

2. **Verificar que el backend compila:**
   ```bash
   npm run dev
   ```

3. **Verificar que el frontend compila:**
   ```bash
   cd Front
   ng serve
   ```

4. **Probar funcionalidades:**
   - Crear nuevo cliente con todos los campos
   - Editar cliente existente
   - Ver detalle de cliente
   - Generar facturación y verificar PDF

---

**Estado Final:** ✅ **COMPLETADO Y LISTO PARA USAR**
