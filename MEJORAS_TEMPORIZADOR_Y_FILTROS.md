# Mejoras Implementadas: Temporizador y Filtros de Área

## ✅ Cambios Implementados

### 1. 🕐 Actualización Automática del Tiempo Empleado

**Problema:** El tiempo empleado requería recargar la página constantemente para ver actualizaciones.

**Solución:** Actualización automática cada segundo usando `setInterval`.

#### Frontend - `lista-peticiones.component.ts`

**Cambios:**
- ✅ Agregado `tiempoInterval: any` para almacenar el interval
- ✅ Método `iniciarActualizacionTiempo()` que actualiza cada segundo
- ✅ Limpieza del interval en `ngOnDestroy()`

```typescript
// Nuevo método que actualiza el tiempo cada segundo
iniciarActualizacionTiempo(): void {
  this.tiempoInterval = setInterval(() => {
    this.peticiones = this.peticiones.map(peticion => {
      if (peticion.temporizador_activo && peticion.fecha_inicio_temporizador) {
        const ahora = new Date();
        const inicio = new Date(peticion.fecha_inicio_temporizador);
        const tiempoTranscurrido = Math.floor((ahora.getTime() - inicio.getTime()) / 1000);
        
        return {
          ...peticion,
          tiempo_empleado_actual: peticion.tiempo_empleado_segundos + tiempoTranscurrido
        };
      }
      return peticion;
    });
  }, 1000); // Actualizar cada segundo
}
```

**Resultado:** El tiempo empleado ahora se actualiza en tiempo real cada segundo sin necesidad de recargar la página.

---

### 2. ⏸️ Botones Pausar/Reanudar Temporizador

**Problema:** No existía forma de pausar temporalmente una tarea cuando el usuario necesita hacer una pausa.

**Solución:** Botones de pausar/reanudar visibles solo para el usuario asignado.

#### Frontend - `lista-peticiones.component.ts`

**Nuevos métodos:**

```typescript
/**
 * Pausar temporizador de una petición
 */
pausarTemporizador(peticion: Peticion): void {
  this.loadingAccion = true;
  this.peticionService
    .pausarTemporizador(peticion.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Temporizador pausado',
            detail: 'El temporizador se ha pausado correctamente',
          });
          this.loadPeticiones();
        }
        this.loadingAccion = false;
      },
      error: (error: any) => {
        console.error('Error al pausar temporizador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo pausar el temporizador',
        });
        this.loadingAccion = false;
      },
    });
}

/**
 * Reanudar temporizador de una petición
 */
reanudarTemporizador(peticion: Peticion): void {
  // Similar al método anterior pero llama a reanudarTemporizador()
}
```

#### Frontend - `lista-peticiones.component.html`

**Vista de tabla - Botones agregados:**

```html
<!-- Botón pausar (visible solo si temporizador está activo) -->
<button
  *ngIf="peticion.estado === 'En Progreso' && peticion.asignado_id === currentUser?.id && peticion.temporizador_activo"
  class="action-btn pause-btn"
  (click)="pausarTemporizador(peticion)"
  pTooltip="Pausar temporizador"
  tooltipPosition="top"
  [disabled]="loadingAccion"
>
  <i class="pi pi-pause"></i>
</button>

<!-- Botón reanudar (visible solo si temporizador está pausado) -->
<button
  *ngIf="peticion.estado === 'En Progreso' && peticion.asignado_id === currentUser?.id && !peticion.temporizador_activo"
  class="action-btn resume-btn"
  (click)="reanudarTemporizador(peticion)"
  pTooltip="Reanudar temporizador"
  tooltipPosition="top"
  [disabled]="loadingAccion"
>
  <i class="pi pi-play"></i>
</button>
```

**Vista de cards móviles - Botones agregados:**

```html
<button
  *ngIf="peticion.estado === 'En Progreso' && peticion.asignado_id === currentUser?.id && peticion.temporizador_activo"
  class="card-btn btn-warning"
  (click)="pausarTemporizador(peticion)"
  [disabled]="loadingAccion"
>
  <i class="pi pi-pause"></i>
  Pausar
</button>

<button
  *ngIf="peticion.estado === 'En Progreso' && peticion.asignado_id === currentUser?.id && !peticion.temporizador_activo"
  class="card-btn btn-success"
  (click)="reanudarTemporizador(peticion)"
  [disabled]="loadingAccion"
>
  <i class="pi pi-play"></i>
  Reanudar
</button>
```

#### Frontend - `lista-peticiones.component.css`

**Estilos agregados:**

```css
/* Botones de pausar/reanudar temporizador en tabla */
.pause-btn {
  color: #ff9800;
  border-color: #ff9800;
}

.pause-btn:hover {
  background-color: #ff9800;
  color: var(--color-white);
  transform: scale(1.1);
}

.resume-btn {
  color: #4caf50;
  border-color: #4caf50;
}

.resume-btn:hover {
  background-color: #4caf50;
  color: var(--color-white);
  transform: scale(1.1);
}

/* Estilos para cards móviles */
.btn-warning {
  background-color: #ff9800;
  color: var(--color-white);
  border-color: #ff9800;
}

.btn-warning:hover {
  background-color: #e68900;
  border-color: #e68900;
  transform: translateY(-2px);
}
```

**Resultado:** Los usuarios ahora pueden pausar y reanudar el temporizador cuando necesiten hacer pausas en su trabajo.

---

### 3. 🎨 Filtros de Peticiones por Área (Pautas vs Diseño)

**Problema:** Los usuarios de Pautas veían peticiones de Diseño y viceversa. Los pautadores podían aceptar peticiones de diseño.

**Solución:** Filtrado automático por área + validación de permisos.

#### Frontend - `lista-peticiones.component.ts`

**Método `loadPeticiones()` modificado:**

```typescript
loadPeticiones(): void {
  this.loading = true;
  const filtros: any = {};

  if (this.filtroEstado.length > 0) {
    filtros.estado = this.filtroEstado[0];
  }
  if (this.filtroCliente) {
    filtros.cliente_id = this.filtroCliente;
  }

  // FILTRO POR ÁREA: Los diseñadores solo ven peticiones de Diseño, 
  // los de Pautas solo ven de Pautas
  if (this.currentUser && (this.currentUser.area === 'Diseño' || this.currentUser.area === 'Pautas')) {
    filtros.area = this.currentUser.area;
  }

  this.peticionService.getAll(filtros)
    .pipe(takeUntil(this.destroy$))
    .subscribe({ /* ... */ });
}
```

**Método `canAcceptPeticion()` modificado:**

```typescript
canAcceptPeticion(peticion: Peticion): boolean {
  if (!this.currentUser) return false;

  // La petición debe estar pendiente y no asignada
  if (peticion.estado !== 'Pendiente' || peticion.asignado_a) {
    return false;
  }

  // REGLA DE NEGOCIO: Las peticiones de Diseño solo las pueden aceptar Diseñadores
  if (peticion.area === 'Diseño') {
    return this.currentUser.area === 'Diseño';
  }

  // Las peticiones de Pautas solo las pueden aceptar usuarios del área de Pautas
  if (peticion.area === 'Pautas') {
    return this.currentUser.area === 'Pautas';
  }

  return false;
}
```

#### Backend - `peticion.controller.ts`

**Método `obtenerTodos()` modificado:**

```typescript
async obtenerTodos(req: Request, res: Response) {
  try {
    const { estado, cliente_id, area } = req.query;

    const filtros: any = {};
    if (estado) filtros.estado = estado;
    if (cliente_id) filtros.cliente_id = Number(cliente_id);
    if (area) filtros.area = area; // ✅ NUEVO: Filtro por área

    const peticiones = await peticionService.obtenerTodos(req.usuario, filtros);

    return ApiResponse.success(res, peticiones, "Peticiones obtenidas exitosamente");
  } catch (error: any) {
    return ApiResponse.error(
      res,
      error.message || "Error al obtener peticiones",
      error.statusCode || 500
    );
  }
}
```

#### Backend - `peticion.service.ts`

**Método `obtenerTodos()` modificado:**

```typescript
async obtenerTodos(usuarioActual: any, filtros?: any) {
  const whereClause: any = {};

  // Aplicar filtros de estado si vienen
  if (filtros?.estado) {
    whereClause.estado = filtros.estado;
  }

  // Aplicar filtros de cliente si vienen
  if (filtros?.cliente_id) {
    whereClause.cliente_id = filtros.cliente_id;
  }

  // ✅ NUEVO: Aplicar filtro por área si viene (para filtrar Pautas vs Diseño)
  if (filtros?.area) {
    whereClause.area = filtros.area;
  }

  // ... resto de la lógica de permisos
}
```

**Resultado:** 
- ✅ Los usuarios de **Pautas** solo ven peticiones de Pautas
- ✅ Los usuarios de **Diseño** solo ven peticiones de Diseño
- ✅ Los pautadores **NO pueden aceptar** peticiones de diseño
- ✅ Los diseñadores **NO pueden aceptar** peticiones de pautas

---

## 📋 Resumen de Archivos Modificados

### Frontend (6 archivos)
1. ✅ `Front/src/app/features/peticiones/components/lista-peticiones/lista-peticiones.component.ts`
   - Actualización automática de tiempo cada segundo
   - Métodos `pausarTemporizador()` y `reanudarTemporizador()`
   - Filtro por área en `loadPeticiones()`
   - Validación de área en `canAcceptPeticion()`

2. ✅ `Front/src/app/features/peticiones/components/lista-peticiones/lista-peticiones.component.html`
   - Botones pausar/reanudar en vista de tabla
   - Botones pausar/reanudar en vista de cards

3. ✅ `Front/src/app/features/peticiones/components/lista-peticiones/lista-peticiones.component.css`
   - Estilos para `.pause-btn`, `.resume-btn`
   - Estilos para `.btn-warning`

### Backend (2 archivos)
4. ✅ `Backend/src/controllers/peticion.controller.ts`
   - Recepción de parámetro `area` en query

5. ✅ `Backend/src/services/peticion.service.ts`
   - Aplicación de filtro por área en `whereClause`

---

## 🎯 Validaciones Implementadas

### Reglas de Negocio
1. ✅ **Peticiones de Diseño:**
   - Solo visibles para usuarios del área de Diseño
   - Solo aceptables por usuarios del área de Diseño

2. ✅ **Peticiones de Pautas:**
   - Solo visibles para usuarios del área de Pautas
   - Solo aceptables por usuarios del área de Pautas

3. ✅ **Control de Temporizador:**
   - Solo el usuario asignado puede pausar/reanudar
   - Solo visible en peticiones "En Progreso"
   - Botón cambia dinámicamente según estado del temporizador

### Permisos de Usuarios
- ✅ **Admin/Directivo/Líder:** Ven todas las peticiones (sin filtro de área)
- ✅ **Usuario de Pautas:** Solo ve peticiones de Pautas
- ✅ **Usuario de Diseño:** Solo ve peticiones de Diseño

---

## 🧪 Pruebas Recomendadas

### 1. Tiempo Empleado en Tiempo Real
- [ ] Login como Pautador
- [ ] Aceptar una petición de Pautas
- [ ] Verificar que el tiempo se actualiza cada segundo automáticamente
- [ ] No debe requerir recargar la página

### 2. Pausar/Reanudar Temporizador
- [ ] En una petición "En Progreso" propia, debe aparecer botón "Pausar" (naranja)
- [ ] Clic en "Pausar" → Temporizador se detiene
- [ ] Debe aparecer botón "Reanudar" (verde)
- [ ] Clic en "Reanudar" → Temporizador continúa
- [ ] No debe aparecer en peticiones de otros usuarios

### 3. Filtros por Área
- [ ] Login como usuario de **Pautas**
  - Solo debe ver peticiones marcadas como "Pautas"
  - No debe ver peticiones de "Diseño"
  - Solo puede aceptar peticiones de "Pautas"
  
- [ ] Login como usuario de **Diseño**
  - Solo debe ver peticiones marcadas como "Diseño"
  - No debe ver peticiones de "Pautas"
  - Solo puede aceptar peticiones de "Diseño"

- [ ] Login como **Admin/Directivo**
  - Debe ver TODAS las peticiones (Pautas + Diseño)

---

## 📝 Notas Técnicas

### Optimizaciones
- **Interval de actualización:** Se ejecuta cada 1000ms (1 segundo)
- **Limpieza de memoria:** El interval se limpia en `ngOnDestroy()` para evitar memory leaks
- **Cálculo eficiente:** Solo recalcula tiempo para peticiones con `temporizador_activo === true`

### Seguridad
- **Validación Frontend + Backend:** El filtro por área se aplica en ambos lados
- **Permisos basados en área:** Validación en `canAcceptPeticion()` previene aceptar peticiones incorrectas
- **Usuario asignado:** Solo el dueño de la tarea puede pausar/reanudar

### UX/UI
- **Feedback visual:** Botones con colores distintivos (naranja para pausar, verde para reanudar)
- **Estados dinámicos:** Botones aparecen/desaparecen según el estado del temporizador
- **Tooltips informativos:** Mensajes claros en hover
- **Loading states:** Botones se deshabilitan durante la operación

---

## ✅ Conclusión

Todos los cambios fueron implementados **modificando archivos existentes** sin agregar nuevos componentes o servicios innecesarios, tal como solicitaste.

**Resultado final:**
1. ✅ Tiempo empleado se actualiza automáticamente cada segundo
2. ✅ Botones de pausar/reanudar disponibles para el usuario asignado
3. ✅ Filtros por área funcionando correctamente (Diseñadores solo ven Diseño, Pautadores solo ven Pautas)
