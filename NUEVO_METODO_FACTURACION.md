# ⚡ NUEVO MÉTODO DE FACTURACIÓN AUTOMÁTICA

## 🎯 Descripción

El método de **Facturación Automática** permite generar periodos de facturación para **TODOS los clientes** que tengan peticiones resueltas en un periodo específico (mes/año), con **un solo clic**.

**Antes:** Había que generar facturación manualmente para cada usuario o cliente.
**Ahora:** Un botón genera facturación para TODAS las peticiones resueltas del periodo.

---

## 🏗️ Arquitectura de la Solución

```
┌─────────────────────────────────────────────────┐
│          RESUMEN DE FACTURACIÓN (Frontend)      │
│  ┌──────────────────────────────────────────┐   │
│  │ [Botón: Facturación Automática] ⚡       │   │
│  └──────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────┘
                    │ POST /api/facturacion/generar-automatica
                    │ Body: { año: 2024, mes: 1 }
                    ↓
┌─────────────────────────────────────────────────┐
│   BACKEND: FacturacionController                │
│   → generarFacturacionAutomatica()              │
└───────────────────┬─────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────┐
│   BACKEND: FacturacionService                   │
│   → generarFacturacionAutomatica(año, mes)     │
│                                                  │
│   1. Consultar peticiones_historico             │
│      WHERE estado = 'Resuelta'                  │
│      AND fecha_resolucion BETWEEN inicio-fin    │
│                                                  │
│   2. Agrupar por cliente_id                     │
│                                                  │
│   3. Para cada cliente:                         │
│      - Crear/Actualizar PeriodoFacturacion      │
│      - total_peticiones                         │
│      - costo_total                              │
│      - estado: "Abierto"                        │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Implementación Backend

### **Archivo:** `Backend/src/services/facturacion.service.ts`

```typescript
/**
 * Genera facturación automática para TODAS las peticiones resueltas del periodo
 * que no tengan un periodo de facturación asociado
 */
async generarFacturacionAutomatica(año: number, mes: number) {
  const fechaInicio = new Date(año, mes - 1, 1);
  const fechaFin = new Date(año, mes, 0, 23, 59, 59);

  // 1. Buscar TODAS las peticiones resueltas del periodo en el histórico
  const peticionesResueltas = await PeticionHistorico.findAll({
    where: {
      estado: "Resuelta",
      fecha_resolucion: {
        [Op.between]: [fechaInicio, fechaFin],
      },
    },
    include: [
      {
        model: Cliente,
        as: "cliente",
        attributes: ["id", "nombre", "pais"],
      },
      {
        model: Categoria,
        as: "categoria",
        attributes: ["nombre", "area_tipo"],
      },
    ],
  });

  if (peticionesResueltas.length === 0) {
    return {
      mensaje: "No hay peticiones resueltas para este periodo",
      periodos_generados: 0,
      total_peticiones: 0,
      costo_total: 0,
    };
  }

  // 2. Agrupar por cliente_id
  const peticionesPorCliente: any = {};

  peticionesResueltas.forEach((peticion) => {
    const clienteId = peticion.cliente_id;

    if (!peticionesPorCliente[clienteId]) {
      peticionesPorCliente[clienteId] = {
        cliente: (peticion as any).cliente,
        peticiones: [],
        costo_total: 0,
      };
    }

    peticionesPorCliente[clienteId].peticiones.push(peticion);
    peticionesPorCliente[clienteId].costo_total += Number(peticion.costo);
  });

  // 3. Crear/actualizar periodo de facturación para cada cliente
  const periodosGenerados = [];
  let totalPeticiones = 0;
  let costoTotal = 0;

  for (const clienteId in peticionesPorCliente) {
    const data = peticionesPorCliente[clienteId];

    // Buscar si ya existe un periodo
    const [periodo, created] = await PeriodoFacturacion.findOrCreate({
      where: {
        cliente_id: Number(clienteId),
        año,
        mes,
      },
      defaults: {
        cliente_id: Number(clienteId),
        año,
        mes,
        total_peticiones: data.peticiones.length,
        costo_total: data.costo_total,
        estado: "Abierto",
      },
    });

    if (!created) {
      // Si ya existía, actualizar con los nuevos totales
      await periodo.update({
        total_peticiones: data.peticiones.length,
        costo_total: data.costo_total,
      });
    }

    periodosGenerados.push({
      periodo_id: periodo.id,
      cliente: data.cliente.nombre,
      peticiones: data.peticiones.length,
      costo: data.costo_total,
      estado: created ? "Creado" : "Actualizado",
    });

    totalPeticiones += data.peticiones.length;
    costoTotal += data.costo_total;
  }

  console.log(
    `✅ Facturación automática generada: ${periodosGenerados.length} clientes, ${totalPeticiones} peticiones, $${costoTotal}`
  );

  return {
    mensaje: "Facturación automática generada exitosamente",
    periodos_generados: periodosGenerados.length,
    total_peticiones: totalPeticiones,
    costo_total: costoTotal,
    detalle: periodosGenerados,
  };
}
```

### **Explicación del Código:**

#### **1. Definir Rango de Fechas**
```typescript
const fechaInicio = new Date(año, mes - 1, 1);  // Primer día del mes
const fechaFin = new Date(año, mes, 0, 23, 59, 59);  // Último día del mes
```

#### **2. Consultar Peticiones Resueltas**
```typescript
const peticionesResueltas = await PeticionHistorico.findAll({
  where: {
    estado: "Resuelta",  // ✅ Solo las completadas
    fecha_resolucion: {
      [Op.between]: [fechaInicio, fechaFin]  // ✅ Del periodo específico
    }
  },
  include: [
    { model: Cliente, as: "cliente" },
    { model: Categoria, as: "categoria" }
  ]
});
```

**¿Por qué `peticiones_historico`?**
- Las peticiones con estado "Resuelta" SOLO existen en la tabla de histórico
- Cuando se marca una petición como resuelta, se mueve automáticamente al histórico

#### **3. Agrupar por Cliente**
```typescript
const peticionesPorCliente: any = {};

peticionesResueltas.forEach((peticion) => {
  const clienteId = peticion.cliente_id;

  if (!peticionesPorCliente[clienteId]) {
    peticionesPorCliente[clienteId] = {
      cliente: peticion.cliente,
      peticiones: [],
      costo_total: 0
    };
  }

  peticionesPorCliente[clienteId].peticiones.push(peticion);
  peticionesPorCliente[clienteId].costo_total += Number(peticion.costo);
});
```

**Resultado:**
```javascript
{
  "1": {  // Cliente ID 1
    "cliente": { id: 1, nombre: "Coca-Cola" },
    "peticiones": [peticion1, peticion2, peticion3],
    "costo_total": 150000
  },
  "2": {  // Cliente ID 2
    "cliente": { id: 2, nombre: "Pepsi" },
    "peticiones": [peticion4, peticion5],
    "costo_total": 100000
  }
}
```

#### **4. Crear/Actualizar Periodo de Facturación**
```typescript
for (const clienteId in peticionesPorCliente) {
  const data = peticionesPorCliente[clienteId];

  const [periodo, created] = await PeriodoFacturacion.findOrCreate({
    where: {
      cliente_id: Number(clienteId),
      año,
      mes
    },
    defaults: {
      cliente_id: Number(clienteId),
      año,
      mes,
      total_peticiones: data.peticiones.length,
      costo_total: data.costo_total,
      estado: "Abierto"
    }
  });

  if (!created) {
    // Si ya existe, actualizar con los nuevos valores
    await periodo.update({
      total_peticiones: data.peticiones.length,
      costo_total: data.costo_total
    });
  }
}
```

**Lógica:**
- `findOrCreate()` busca un periodo existente
- Si NO existe → Lo crea con `defaults`
- Si SÍ existe → Lo actualiza con los nuevos totales

---

## 🌐 Endpoint REST

### **Archivo:** `Backend/src/routes/facturacion.routes.ts`

```typescript
// Generar facturación automática para peticiones resueltas
router.post(
  "/generar-automatica",
  facturacionController.generarFacturacionAutomatica
);
```

### **Archivo:** `Backend/src/controllers/facturacion.controller.ts`

```typescript
async generarFacturacionAutomatica(req: Request, res: Response) {
  try {
    const { año, mes } = req.body;

    const resultado = await facturacionService.generarFacturacionAutomatica(
      Number(año),
      Number(mes)
    );

    return ApiResponse.success(
      res,
      resultado,
      "Facturación automática generada exitosamente"
    );
  } catch (error: any) {
    return ApiResponse.error(
      res,
      error.message || "Error al generar facturación automática",
      error.statusCode || 500
    );
  }
}
```

### **Request**
```http
POST /api/facturacion/generar-automatica
Content-Type: application/json
Authorization: Bearer <token>

{
  "año": 2024,
  "mes": 1
}
```

### **Response Success**
```json
{
  "success": true,
  "message": "Facturación automática generada exitosamente",
  "data": {
    "mensaje": "Facturación automática generada exitosamente",
    "periodos_generados": 15,
    "total_peticiones": 87,
    "costo_total": 3500000,
    "detalle": [
      {
        "periodo_id": 1,
        "cliente": "Coca-Cola",
        "peticiones": 12,
        "costo": 600000,
        "estado": "Creado"
      },
      {
        "periodo_id": 2,
        "cliente": "Pepsi",
        "peticiones": 8,
        "costo": 400000,
        "estado": "Actualizado"
      }
      // ... más clientes
    ]
  }
}
```

### **Response Sin Peticiones**
```json
{
  "success": true,
  "data": {
    "mensaje": "No hay peticiones resueltas para este periodo",
    "periodos_generados": 0,
    "total_peticiones": 0,
    "costo_total": 0
  }
}
```

---

## 🎨 Implementación Frontend

### **Archivo:** `Front/src/app/core/services/facturacion.service.ts`

```typescript
// Generar facturación automática para peticiones resueltas
generarAutomatica(año: number, mes: number): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    API_ENDPOINTS.FACTURACION.GENERAR_AUTOMATICA,
    { año, mes }
  );
}
```

### **Archivo:** `Front/src/app/core/constants/api.constants.ts`

```typescript
FACTURACION: {
  // ... otros endpoints
  GENERAR_AUTOMATICA: `${environment.apiUrl}/facturacion/generar-automatica`,
}
```

### **Archivo:** `Front/src/app/features/facturacion/components/resumen-facturacion/resumen-facturacion.component.ts`

```typescript
generarAutomatica(): void {
  this.confirmationService.confirm({
    message: `¿Está seguro de generar la facturación automática para ${this.meses[this.selectedMes - 1].label} ${this.selectedAnio}? Esto creará periodos de facturación para TODOS los clientes con peticiones resueltas en este periodo.`,
    header: 'Confirmar Generación Automática',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.loading = true;
      this.facturacionService
        .generarAutomatica(this.selectedAnio, this.selectedMes)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Facturación automática generada: ${response.data.periodos_generados} clientes, ${response.data.total_peticiones} peticiones, $${response.data.costo_total.toLocaleString()}`
              });
              this.loadResumen();
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error generando facturación automática:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al generar la facturación automática'
            });
            this.loading = false;
          }
        });
    }
  });
}
```

### **Template HTML**

```html
<button
  pButton
  icon="pi pi-bolt"
  label="Facturación Automática"
  (click)="generarAutomatica()"
  [loading]="loading"
  class="p-button-warning"
  pTooltip="Generar facturación para todas las peticiones resueltas del periodo"
  tooltipPosition="bottom"
></button>
```

---

## 🎯 Flujo de Usuario

### **Paso 1:** Seleccionar Periodo
```
┌─────────────────────────────────────────┐
│ Resumen de Facturación                  │
│                                          │
│  Mes: [Enero ▼]  Año: [2024 ▼]         │
└─────────────────────────────────────────┘
```

### **Paso 2:** Hacer Clic en "Facturación Automática"
```
┌─────────────────────────────────────────┐
│  [🔄 Actualizar]  [⚡ Facturación       │
│                    Automática]          │
└─────────────────────────────────────────┘
```

### **Paso 3:** Confirmar Acción
```
┌─────────────────────────────────────────┐
│  ⚠️  Confirmar Generación Automática    │
│                                          │
│  ¿Está seguro de generar la facturación│
│  automática para Enero 2024?            │
│                                          │
│  [Cancelar]  [Aceptar]                  │
└─────────────────────────────────────────┘
```

### **Paso 4:** Ver Resultado
```
┌─────────────────────────────────────────┐
│  ✅ Éxito                                │
│                                          │
│  Facturación automática generada:       │
│  - 15 clientes                          │
│  - 87 peticiones                        │
│  - $3,500,000                           │
└─────────────────────────────────────────┘
```

### **Paso 5:** Ver Periodos Generados
```
┌─────────────────────────────────────────┐
│  Cliente         Peticiones  Costo      │
├─────────────────────────────────────────┤
│  Coca-Cola          12      $600,000    │
│  Pepsi               8      $400,000    │
│  McDonald's         15      $750,000    │
│  ...                                     │
└─────────────────────────────────────────┘
```

---

## 🚨 Casos de Uso

### **Caso 1: Primera Vez del Mes**
- **Situación:** Es 1 de febrero, quieres facturar enero
- **Acción:** Seleccionar año=2024, mes=1, clic en "Facturación Automática"
- **Resultado:** Crea periodos para todos los clientes con peticiones resueltas en enero

### **Caso 2: Re-generación**
- **Situación:** Ya generaste facturación, pero se resolvieron más peticiones
- **Acción:** Volver a hacer clic en "Facturación Automática"
- **Resultado:** Actualiza los periodos existentes con los nuevos totales

### **Caso 3: Sin Peticiones**
- **Situación:** No hubo peticiones resueltas en el mes
- **Acción:** Clic en "Facturación Automática"
- **Resultado:** Mensaje: "No hay peticiones resueltas para este periodo"

---

## ⚖️ Ventajas vs. Método Manual

### **Método Manual (Antes):**
❌ Había que generar facturación para cada cliente individualmente
❌ Se podían olvidar clientes
❌ Proceso lento y tedioso
❌ Propenso a errores humanos

### **Método Automático (Ahora):**
✅ Un solo clic genera TODO
✅ Garantiza que TODOS los clientes se facturen
✅ Rápido (segundos vs. minutos)
✅ Sin errores
✅ Actualiza periodos existentes si se vuelve a ejecutar

---

## 🔒 Seguridad y Permisos

### **Endpoint Protegido:**
```typescript
router.use(roleAuth("Admin", "Directivo"));
```

**Solo pueden usar esta función:**
- ✅ Admin
- ✅ Directivo
- ❌ Usuario normal
- ❌ Líder

---

## 🧪 Testing

### **Test Manual:**

1. **Crear peticiones de prueba:**
   - Crear 3 peticiones para Cliente A
   - Crear 2 peticiones para Cliente B
   - Marcar TODAS como "Resuelta"

2. **Ejecutar Facturación Automática:**
   ```http
   POST /api/facturacion/generar-automatica
   Body: { "año": 2024, "mes": 1 }
   ```

3. **Verificar:**
   - ✅ Se crearon 2 periodos (Cliente A y Cliente B)
   - ✅ Cliente A tiene `total_peticiones = 3`
   - ✅ Cliente B tiene `total_peticiones = 2`
   - ✅ `costo_total` es la suma correcta

4. **Resolver más peticiones:**
   - Crear y resolver 1 petición más para Cliente A

5. **Re-ejecutar Facturación Automática:**
   - ✅ Cliente A ahora tiene `total_peticiones = 4`
   - ✅ Cliente B sigue con `total_peticiones = 2`

---

## 📊 Monitoreo

### **Logs en Backend:**
```
✅ Facturación automática generada: 15 clientes, 87 peticiones, $3500000
```

### **Métricas a Revisar:**
- Número de periodos generados
- Total de peticiones procesadas
- Costo total facturado
- Tiempo de ejecución

---

## ✅ Checklist de Implementación

- [x] Crear método `generarFacturacionAutomatica()` en `facturacion.service.ts`
- [x] Crear endpoint POST `/generar-automatica` en `facturacion.routes.ts`
- [x] Agregar controller en `facturacion.controller.ts`
- [x] Agregar método `generarAutomatica()` en servicio frontend
- [x] Agregar constante `GENERAR_AUTOMATICA` en `api.constants.ts`
- [x] Crear método `generarAutomatica()` en componente
- [x] Agregar botón en template HTML
- [x] Agregar confirmación de usuario
- [x] Mostrar toast de éxito/error
- [x] Documentar en `NUEVO_METODO_FACTURACION.md`

---

## 🎓 Resumen Final

### **Cómo Funciona:**
1. Usuario selecciona año/mes
2. Hace clic en "Facturación Automática"
3. Backend consulta `peticiones_historico` con `estado='Resuelta'` y `fecha_resolucion` del periodo
4. Agrupa por `cliente_id`
5. Crea/actualiza `PeriodoFacturacion` para cada cliente
6. Retorna resumen con totales

### **Beneficios:**
- ⚡ Rápido (un clic)
- 🎯 Preciso (no se olvida ningún cliente)
- 🔄 Actualizable (se puede re-ejecutar)
- 📊 Completo (incluye todas las peticiones resueltas)

### **Importante:**
- ✅ Solo procesa peticiones en `peticiones_historico`
- ✅ Solo peticiones con `estado='Resuelta'`
- ✅ Filtra por `fecha_resolucion`, no `fecha_creacion`
- ✅ Crea periodos con `estado='Abierto'` (se pueden cerrar/facturar después)

---

**✅ ¡La facturación automática está completa y lista para usar!**
