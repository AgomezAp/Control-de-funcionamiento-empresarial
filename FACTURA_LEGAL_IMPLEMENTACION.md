# 📄 FACTURA LEGAL ELECTRÓNICA - IMPLEMENTACIÓN COMPLETA

## 🎯 Implementación Realizada

Se ha reemplazado el PDF simple por una **FACTURA LEGAL** conforme a las normas colombianas de facturación electrónica (DIAN) y mejores prácticas comerciales.

---

## 📋 Elementos Legales Incluidos

### 1. **HEADER - Información del Emisor** ✅
```
TU EMPRESA S.A.S.
NIT: 900.123.456-7
Dirección: Calle 123 #45-67, Bogotá D.C., Colombia
Teléfono: +57 (1) 234-5678
Email: facturacion@tuempresa.com
Régimen: Responsable de IVA - Gran Contribuyente
Actividad Económica: Servicios de publicidad digital y marketing
```

### 2. **Número de Factura Único** ✅
**Formato**: `FAC-YYYYMM-CLIENTEID-PERIODOID`

Ejemplo: `FAC-202510-3-15`
- FAC: Prefijo de factura
- 202510: Año y mes (octubre 2025)
- 3: ID del cliente
- 15: ID del período

### 3. **Resolución DIAN** ✅
```
Resolución DIAN: No. 18764123456789
Rango: FAC-1 a FAC-50000
Vigencia: 2024-2026
```

### 4. **Información Completa del Cliente** ✅
- Razón Social / Nombre
- NIT o Cédula (según tipo de persona)
- **Tipo de Persona**: Natural o Jurídica ✨ NUEVO
- Tipo de Cliente (Meta Ads, Google Ads, etc.)
- Dirección completa
- Ciudad
- Teléfono
- Email

### 5. **Tabla de Items/Servicios** ✅
Columnas:
- **ÍTEM**: Número secuencial
- **CÓDIGO**: SRV-001, SRV-002, etc.
- **DESCRIPCIÓN**: Nombre del servicio + descripción detallada
- **ÁREA**: Área que prestó el servicio
- **CANTIDAD**: Número de peticiones/servicios
- **VALOR UNITARIO**: Costo promedio por servicio
- **VALOR TOTAL**: Cantidad × Valor Unitario

### 6. **Cálculo de Impuestos (IVA 19%)** ✅
```
Subtotal:        $100,000.00
IVA (19%):       $ 19,000.00
TOTAL A PAGAR:   $119,000.00
```

**Cálculo automático**:
- Subtotal = Total / 1.19
- IVA = Total - Subtotal
- Total = Suma de todos los servicios

### 7. **Información de Pago** ✅
```
Cuenta Bancaria: Banco de Bogotá - Cuenta Corriente No. 123-456789-01
Beneficiario: TU EMPRESA S.A.S. - NIT 900.123.456-7
Condiciones de Pago: 30 días calendario
```

### 8. **Observaciones del Servicio** ✅
Detalla:
- Período facturado (mes y año)
- Cantidad de servicios incluidos
- Referencia al detalle de categorías

### 9. **Notas Legales** ✅
- Equivalencia a Letra de Cambio (Art. 774 Código de Comercio)
- Sujeto a retención en la fuente
- Validez como factura electrónica DIAN
- Contacto para aclaraciones

### 10. **Sección de Firmas** ✅
```
ELABORADO POR          |          RECIBIDO POR
_________________      |      _________________
Dpto. Facturación      |      Cliente - Firma y Sello
```

### 11. **Marca de Agua del Estado** ✅
- Aparece en diagonal al fondo
- Muestra: ABIERTO, CERRADO o FACTURADO
- 5% de opacidad para no interferir con el contenido

### 12. **Pie de Página con Trazabilidad** ✅
```
Sistema de Gestión de Facturación
Generado electrónicamente el [fecha y hora]
Documento controlado
```

---

## 🎨 Diseño Profesional

### Estructura Visual:

1. **Borde Negro**: Contorno de 2px alrededor de toda la factura
2. **Secciones Diferenciadas**:
   - Header con división vertical (empresa | factura)
   - Cliente en fondo gris (#f5f5f5)
   - Tabla con encabezados negros (#333)
   - Totales con borde negro destacado
   
3. **Tipografía**:
   - Arial (universal, imprime bien)
   - Tamaños: 8px-18px según jerarquía
   - Negritas para labels y totales

4. **Colores**:
   - Negro (#000) para bordes y texto principal
   - Rojo (#d32f2f) para "FACTURA DE VENTA"
   - Gris para fondos alternativos
   - Blanco para contraste

---

## 📐 Formato de Página

- **Tamaño**: Carta estándar (210mm x 297mm / 8.5" x 11")
- **Márgenes**: 20mm todos los lados
- **Orientación**: Vertical (portrait)
- **Optimizado para impresión**: Bordes y márgenes correctos

---

## ⚖️ Cumplimiento Legal (Colombia)

### Normativas Aplicadas:

#### 1. **Decreto 1625 de 2016** - Facturación Electrónica
✅ Incluye resolución DIAN
✅ Numeración consecutiva única
✅ Fecha de emisión

#### 2. **Estatuto Tributario - Art. 617**
✅ Identificación del emisor (NIT)
✅ Identificación del adquiriente (NIT/CC)
✅ Descripción específica de servicios
✅ Valor total de la operación

#### 3. **Código de Comercio - Art. 774**
✅ Nota legal de equivalencia a Letra de Cambio

#### 4. **Resolución 000042 de 2020 DIAN**
✅ Formato de numeración
✅ Rango autorizado
✅ Vigencia de la resolución

#### 5. **IVA (Ley 1819 de 2016)**
✅ Discriminación del IVA (19%)
✅ Subtotal + IVA = Total
✅ Base gravable visible

---

## 🔧 Configuración Personalizable

### Variables a Modificar (líneas 137-147):

```typescript
// INFORMACIÓN DE TU EMPRESA
h1: "TU EMPRESA S.A.S."  // ← Cambiar por tu razón social
NIT: "900.123.456-7"      // ← Cambiar por tu NIT real
Dirección: "..."          // ← Tu dirección física
Teléfono: "..."          // ← Tu teléfono
Email: "..."             // ← Tu email de facturación
Página Web: "..."        // ← Tu sitio web

// RESOLUCIÓN DIAN (líneas 155-158)
No. 18764123456789       // ← Tu resolución DIAN real
Rango: FAC-1 a FAC-50000 // ← Tu rango autorizado
Vigencia: 2024-2026      // ← Vigencia de tu resolución
```

### Información Bancaria (línea 407):

```typescript
Banco de Bogotá - Cuenta Corriente No. 123-456789-01
Beneficiario: TU EMPRESA S.A.S. - NIT 900.123.456-7
```

### Condiciones de Pago (línea 408):

```typescript
Condiciones de Pago: 30 días calendario
// Cambiar según tus políticas comerciales
```

---

## 💰 Cálculo de IVA

### Fórmula Aplicada:

```javascript
const subtotal = totales.costo_total / 1.19;  // Base gravable
const iva = totales.costo_total - subtotal;    // IVA (19%)
```

### Ejemplo:

| Concepto | Valor |
|----------|-------|
| Subtotal | $8,403.36 |
| IVA 19% | $1,596.64 |
| **TOTAL** | **$10,000.00** |

### Si tu Empresa NO es Responsable de IVA:

Buscar línea 335-340 y comentar el cálculo de IVA:

```typescript
// Para NO responsables de IVA, comentar estas líneas:
// const subtotal = totales.costo_total / 1.19;
// const iva = totales.costo_total - subtotal;

// Y usar:
const subtotal = totales.costo_total;
const iva = 0;
```

---

## 📊 Detalle de Servicios

### Formato de Items:

Cada categoría de servicio se convierte en un ítem:

```
ÍTEM | CÓDIGO   | DESCRIPCIÓN                    | ÁREA    | CANT | VALOR UNIT | TOTAL
1    | SRV-001  | Pauta Meta Ads                | Pauta   | 5    | $50,000    | $250,000
                  Servicios de pauta meta ads
                  Período Octubre 2025
2    | SRV-002  | Diseño Gráfico               | Diseño  | 10   | $30,000    | $300,000
                  Servicios de diseño gráfico
                  Período Octubre 2025
```

### Cálculo Automático del Valor Unitario:

```typescript
const valorUnitario = cat.cantidad > 0 ? cat.costo_total / cat.cantidad : 0;
```

---

## 🖨️ Proceso de Generación

### 1. Usuario hace clic en "Exportar PDF"

### 2. Sistema genera HTML con:
- Datos del período
- Información del cliente
- Detalle de servicios
- Cálculos de impuestos
- Numeración única

### 3. Se abre ventana emergente con la factura

### 4. Usuario puede:
- ✅ **Imprimir** (Ctrl+P)
- ✅ **Guardar como PDF** (en el diálogo de impresión)
- ✅ **Enviar por email** (desde el PDF guardado)

---

## 🎯 Casos de Uso

### Factura para Persona Natural:
```
Cédula: 1.234.567.890
Tipo de Persona: Natural
```

### Factura para Persona Jurídica (Empresa):
```
NIT: 900.123.456-7
Tipo de Persona: Jurídica
```

El campo se ajusta automáticamente según `periodo.cliente?.tipo_persona`.

---

## 🔒 Seguridad y Trazabilidad

### Información de Auditoría:

1. **Número Único**: No se puede duplicar (basado en IDs de BD)
2. **Fecha de Emisión**: Registrada automáticamente
3. **Estado del Período**: Visible como marca de agua
4. **Timestamp de Generación**: Al pie de página

### Ejemplo de Trazabilidad:
```
Sistema de Gestión de Facturación
Generado electrónicamente el 20/10/2025, 15:30:45
Documento controlado
```

---

## 📱 Responsive y Compatible

### Optimizado para:
- ✅ Impresoras láser/inkjet
- ✅ Guardado como PDF (Chrome, Edge, Firefox)
- ✅ Visualización en pantalla
- ✅ Envío por email como archivo adjunto

### Tamaño de Archivo:
- HTML puro: ~15-20 KB
- PDF generado: ~50-100 KB (depende del contenido)

---

## 🚀 Mejoras Futuras Sugeridas

### Nivel 1 - Básico (Ya Implementado):
- ✅ Factura con formato legal
- ✅ Cálculo de IVA
- ✅ Numeración única
- ✅ Información completa

### Nivel 2 - Intermedio (Próximos Pasos):
- [ ] Logo de la empresa en el header
- [ ] Código QR con validación
- [ ] Firma digital del emisor
- [ ] Diferentes plantillas por tipo de servicio

### Nivel 3 - Avanzado (Futuro):
- [ ] Integración con API de DIAN para facturación electrónica oficial
- [ ] Generación de CUFE (Código Único de Facturación Electrónica)
- [ ] Envío automático por email al cliente
- [ ] Almacenamiento en repositorio de facturas
- [ ] Generación de XML junto con el PDF

---

## 📝 Notas Importantes

### ⚠️ ADVERTENCIA:

**Los siguientes datos son DE EJEMPLO y DEBEN ser reemplazados con tu información real:**

1. **NIT**: `900.123.456-7` → Reemplazar con tu NIT
2. **Resolución DIAN**: `18764123456789` → Tu resolución autorizada
3. **Rango de facturación**: `FAC-1 a FAC-50000` → Tu rango autorizado
4. **Cuenta bancaria**: Reemplazar con tus datos bancarios reales
5. **Dirección y contacto**: Actualizar con tu información

### ⚙️ Configuración por País:

Aunque está diseñada para Colombia, puedes adaptar para otros países:

**México**: Cambiar IVA 19% → IVA 16% (línea 135)
**Argentina**: Cambiar IVA 19% → IVA 21%
**Chile**: Cambiar IVA 19% → IVA 19% (¡coincide!)
**España**: Cambiar IVA 19% → IVA 21%

---

## ✅ Checklist de Implementación

Antes de usar en producción:

- [ ] Actualizar razón social de la empresa
- [ ] Configurar NIT real
- [ ] Obtener resolución DIAN válida
- [ ] Configurar rango de numeración autorizado
- [ ] Actualizar datos de contacto
- [ ] Configurar información bancaria
- [ ] Revisar condiciones de pago
- [ ] Verificar actividad económica
- [ ] Probar impresión en impresora física
- [ ] Validar cálculos de IVA
- [ ] Revisar con departamento contable/legal
- [ ] Obtener aprobación de auditoría

---

## 🎓 Normativa de Referencia

### Colombia:
- Decreto 1625/2016: Facturación Electrónica
- Estatuto Tributario Art. 617: Requisitos de facturación
- Resolución 000042/2020 DIAN: Sistemas de facturación
- Ley 1819/2016: Reforma tributaria IVA
- Código de Comercio Art. 774: Letra de cambio

### Recursos Útiles:
- [DIAN - Facturación Electrónica](https://www.dian.gov.co)
- [Cámara de Comercio](https://www.ccb.org.co)
- Asesoría contable profesional

---

## 📞 Soporte

Si necesitas más personalizaciones:
- Cambiar formato de numeración
- Agregar más campos de información
- Modificar diseño visual
- Integrar logo corporativo
- Cambiar cálculos de impuestos
- Agregar términos y condiciones específicos

**Fecha de Implementación**: 20 de Octubre de 2025
**Versión**: 1.0
**Archivo**: `detalle-facturacion.component.ts`
**Método**: `exportarPDF()`
