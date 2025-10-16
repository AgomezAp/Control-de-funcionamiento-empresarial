# ✅ Agregado KPI de Peticiones Pausadas en Dashboard Admin

## 📋 Solicitud del Usuario

Agregar un nuevo campo KPI en el Dashboard del Administrador que muestre la cantidad de **peticiones pausadas**, ya que actualmente no aparecen ni en "Pendientes" ni en "En Progreso".

## ✅ Implementación Completa

### 1. Backend - Agregar conteo de pausadas en resumen global

**Archivo:** `Backend/src/services/peticion.service.ts` (línea 687-720)

#### Cambios:
```typescript
async obtenerResumenGlobal() {
  // Contar peticiones activas
  const peticionesActivas = await Peticion.findAll();
  
  // Contar peticiones históricas
  const peticionesHistoricas = await PeticionHistorico.findAll();

  // Totales
  const totalPeticiones = peticionesActivas.length + peticionesHistoricas.length;
  
  // Por estado
  const pendientes = peticionesActivas.filter((p) => p.estado === "Pendiente").length;
  const enProgreso = peticionesActivas.filter((p) => p.estado === "En Progreso").length;
  const pausadas = peticionesActivas.filter((p) => p.estado === "Pausada").length;  // ✅ NUEVO
  const resueltas = peticionesHistoricas.filter((p) => p.estado === "Resuelta").length;
  const canceladas = peticionesHistoricas.filter((p) => p.estado === "Cancelada").length;

  // Costo total
  const costoActivas = peticionesActivas.reduce((sum, p) => sum + Number(p.costo), 0);
  const costoHistoricas = peticionesHistoricas.reduce((sum, p) => sum + Number(p.costo), 0);
  const costoTotal = costoActivas + costoHistoricas;

  return {
    total_peticiones: totalPeticiones,
    por_estado: {
      pendientes,
      en_progreso: enProgreso,
      pausadas,  // ✅ NUEVO - Campo agregado al response
      resueltas,
      canceladas,
    },
    costo_total: costoTotal,
    activas: peticionesActivas.length,
    historicas: peticionesHistoricas.length,
  };
}
```

**Cambios realizados:**
- ✅ Agregada línea 699: `const pausadas = peticionesActivas.filter((p) => p.estado === "Pausada").length;`
- ✅ Agregado campo `pausadas` en el objeto `por_estado` (línea 711)

---

### 2. Frontend - TypeScript Component

**Archivo:** `Front/src/app/components/dashboard-admin/dashboard-admin.component.ts`

#### Cambio 1: Agregar variable (línea 47-52)
```typescript
// Estadísticas generales
totalPeticiones: number = 0;
peticionesPendientes: number = 0;
peticionesEnProgreso: number = 0;
peticionesPausadas: number = 0;  // ✅ NUEVO
peticionesResueltas: number = 0;
costoTotalMes: number = 0;
```

#### Cambio 2: Obtener valor del backend (línea 100-112)
```typescript
if (response.success && response.data) {
  const resumen = response.data;
  
  // Usar el resumen que incluye AMBAS tablas
  this.totalPeticiones = resumen.total_peticiones;
  this.peticionesPendientes = resumen.por_estado.pendientes;
  this.peticionesEnProgreso = resumen.por_estado.en_progreso;
  this.peticionesPausadas = resumen.por_estado.pausadas || 0;  // ✅ NUEVO
  this.peticionesResueltas = resumen.por_estado.resueltas;

  // Setup chart con los datos correctos
  this.setupChartPeticionesPorEstadoFromResumen(resumen.por_estado);
}
```

#### Cambio 3: Calcular cuando se filtra por área (línea 313-320)
```typescript
// Cargar peticiones activas del área
this.peticionService.getAll({ area }).subscribe({
  next: (response: any) => {
    if (response.success && response.data) {
      const peticiones = response.data;
      this.peticionesPendientes = peticiones.filter((p: any) => p.estado === 'Pendiente').length;
      this.peticionesEnProgreso = peticiones.filter((p: any) => p.estado === 'En Progreso').length;
      this.peticionesPausadas = peticiones.filter((p: any) => p.estado === 'Pausada').length;  // ✅ NUEVO
      
      // Detectar peticiones vencidas
      this.detectPeticionesVencidas(peticiones);
    }
  }
});
```

---

### 3. Frontend - HTML Template

**Archivo:** `Front/src/app/components/dashboard-admin/dashboard-admin.component.html`

#### Nueva Tarjeta KPI (agregada después de "En Progreso")
```html
<!-- KPI: Pausadas -->
<p-card styleClass="kpi-card">
  <div class="kpi-content">
    <div class="kpi-icon" style="background-color: rgba(255, 152, 0, 0.1)">
      <i class="pi pi-pause" style="color: #ff9800"></i>
    </div>
    <div class="kpi-details">
      <p class="kpi-label">Pausadas</p>
      <h2 class="kpi-value">{{ peticionesPausadas }}</h2>
    </div>
  </div>
</p-card>
```

**Características de la tarjeta:**
- **Icono:** `pi-pause` (símbolo de pausa ⏸️)
- **Color:** Naranja (`#ff9800`) - Color distintivo para estado pausado
- **Background:** `rgba(255, 152, 0, 0.1)` - Naranja claro translúcido
- **Label:** "Pausadas"
- **Valor:** `{{ peticionesPausadas }}` - Binding a la variable TypeScript

---

## 🎨 Diseño Visual

### Orden de KPIs en el Dashboard:
1. 📄 **Total Peticiones** (azul)
2. 🕐 **Pendientes** (amarillo)
3. 🔄 **En Progreso** (verde)
4. ⏸️ **Pausadas** (naranja) ⬅️ **NUEVO**
5. ✅ **Resueltas** (verde claro)
6. 💵 **Costo Total** (amarillo)

### Colores del KPI Pausadas:
```css
/* Icono y background */
background-color: rgba(255, 152, 0, 0.1);  /* Naranja claro */
color: #ff9800;                             /* Naranja */
```

**Consistencia con Badge:**
El color naranja (#ff9800) coincide con el badge de estado "Pausada" usado en toda la aplicación.

---

## 📊 Flujo de Datos

### Backend → Frontend:

```
┌─────────────────────────────────────┐
│  Backend                            │
│  peticion.service.ts                │
│  obtenerResumenGlobal()             │
└─────────────────┬───────────────────┘
                  │
                  │ HTTP GET /peticiones/resumen/global
                  │
                  ▼
         {
           total_peticiones: 14,
           por_estado: {
             pendientes: 0,
             en_progreso: 0,
             pausadas: 1,      ⬅️ NUEVO
             resueltas: 13,
             canceladas: 0
           },
           costo_total: 777000,
           ...
         }
                  │
                  │
                  ▼
┌─────────────────────────────────────┐
│  Frontend                           │
│  dashboard-admin.component.ts       │
│                                     │
│  this.peticionesPausadas =          │
│    resumen.por_estado.pausadas || 0 │
└─────────────────┬───────────────────┘
                  │
                  │ Data Binding
                  │
                  ▼
┌─────────────────────────────────────┐
│  HTML Template                      │
│  {{ peticionesPausadas }}           │
│                                     │
│  Renderiza: 1                       │
└─────────────────────────────────────┘
```

---

## 🧪 Pruebas Requeridas

### Test Case 1: Ver peticiones pausadas en Dashboard
**Preparación:**
1. Login como Admin
2. Pausar una o más peticiones
3. Ir a Dashboard - Administrador

**Resultado Esperado:**
- ✅ Aparece nueva tarjeta KPI "Pausadas" con color naranja
- ✅ El número refleja la cantidad correcta de peticiones pausadas
- ✅ Al pausar otra petición, el contador se actualiza (refrescar página)

### Test Case 2: Filtrar por área
**Preparación:**
1. Tener peticiones pausadas en diferentes áreas
2. Login como Admin
3. Ir a Dashboard - Administrador

**Acción:**
4. Seleccionar un área específica en el dropdown

**Resultado Esperado:**
- ✅ El contador de "Pausadas" muestra solo las del área seleccionada
- ✅ Los otros KPIs también se filtran correctamente

### Test Case 3: Sin peticiones pausadas
**Preparación:**
1. No tener ninguna petición pausada en el sistema

**Resultado Esperado:**
- ✅ Tarjeta KPI "Pausadas" muestra: **0**
- ✅ No genera errores en consola

### Test Case 4: Verificar response del backend
**Acción:**
1. Abrir DevTools (F12) → Network
2. Refrescar Dashboard Admin
3. Ver request a `/peticiones/resumen/global`

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "total_peticiones": 14,
    "por_estado": {
      "pendientes": 0,
      "en_progreso": 0,
      "pausadas": 1,     ⬅️ Campo presente
      "resueltas": 13,
      "canceladas": 0
    },
    "costo_total": 777000,
    "activas": 1,
    "historicas": 13
  }
}
```

---

## 📝 Archivos Modificados

| Archivo | Líneas | Cambios |
|---------|--------|---------|
| `Backend/src/services/peticion.service.ts` | 699, 711 | Agregar conteo de pausadas y campo en response |
| `Front/.../dashboard-admin.component.ts` | 50, 108, 318 | Variable, obtención de dato, filtro por área |
| `Front/.../dashboard-admin.component.html` | Después línea 74 | Nueva tarjeta KPI "Pausadas" |

**Total:** 3 archivos modificados, ~15 líneas agregadas

---

## ✅ Checklist de Implementación

- [x] Backend: Agregar filtro `estado === "Pausada"` en `obtenerResumenGlobal()`
- [x] Backend: Agregar campo `pausadas` en objeto `por_estado` del response
- [x] Frontend TS: Agregar variable `peticionesPausadas: number = 0`
- [x] Frontend TS: Obtener valor `resumen.por_estado.pausadas || 0`
- [x] Frontend TS: Calcular pausadas al filtrar por área
- [x] Frontend HTML: Agregar tarjeta KPI con icono `pi-pause` y color naranja
- [x] Sin errores de compilación (backend y frontend)
- [ ] Reiniciar backend
- [ ] Refrescar frontend
- [ ] Probar con peticiones pausadas
- [ ] Probar filtro por área
- [ ] Verificar response en Network tab

---

## 🎯 Resultado Final

### Antes:
```
┌─────────────────────────────────────────────────┐
│ Dashboard - Administrador                       │
├─────────────────────────────────────────────────┤
│ [Total: 14] [Pendientes: 0] [En Progreso: 0]  │
│ [Resueltas: 13] [Costo: $777.000]              │
└─────────────────────────────────────────────────┘

❌ Peticiones pausadas NO se muestran
```

### Después:
```
┌─────────────────────────────────────────────────┐
│ Dashboard - Administrador                       │
├─────────────────────────────────────────────────┤
│ [Total: 14] [Pendientes: 0] [En Progreso: 0]  │
│ [⏸️ Pausadas: 1] ⬅️ NUEVO                      │
│ [Resueltas: 13] [Costo: $777.000]              │
└─────────────────────────────────────────────────┘

✅ Peticiones pausadas ahora visibles
```

---

**Fecha:** 16 de Octubre de 2025  
**Tipo de Cambio:** Feature - Agregar KPI  
**Impacto:** Medio - Mejora visibilidad de dashboard  
**Estado:** ✅ Implementado - Listo para pruebas
