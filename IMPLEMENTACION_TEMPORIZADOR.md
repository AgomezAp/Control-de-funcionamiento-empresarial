# IMPLEMENTACIÓN COMPLETA: SISTEMA DE TEMPORIZADOR POR PETICIÓN

## 📋 Resumen del Cambio

Se ha implementado un **sistema de temporizador activo** para reemplazar el antiguo sistema de "tiempo límite" en las peticiones.

### Cambios Principales:
- ❌ **ELIMINADO**: Campo `tiempo_limite_horas` y `fecha_limite`
- ✅ **AGREGADO**: Sistema de temporizador con pausar/reanudar
- ⏱️ **FUNCIONALIDAD**: Tiempo empleado en segundos con control manual

---

## 🔧 BACKEND - Cambios Realizados

### 1. Modelo `Peticion.ts` (Backend/src/models/)
**Campos eliminados:**
- `tiempo_limite_horas: number | null`
- `fecha_limite: Date | null`

**Campos agregados:**
```typescript
tiempo_empleado_segundos: number (default: 0)
temporizador_activo: boolean (default: false)
fecha_inicio_temporizador: Date | null
fecha_pausa_temporizador: Date | null
```

### 2. Modelo `PeticionHistorico.ts`
- Eliminado: `tiempo_limite_horas`, `fecha_limite`
- Agregado: `tiempo_empleado_segundos`

### 3. Servicio `peticion.service.ts`
**Método modificado:**
- `aceptarPeticion(id, usuarioActual)` - Ya NO requiere `tiempo_limite_horas`
  - Inicia automáticamente el temporizador al aceptar
  - Establece `temporizador_activo = true`
  - Registra `fecha_inicio_temporizador`

**Métodos nuevos agregados:**
```typescript
pausarTemporizador(id, usuarioActual)
- Calcula tiempo transcurrido
- Actualiza tiempo_empleado_segundos
- Establece temporizador_activo = false
- Registra fecha_pausa_temporizador

reanudarTemporizador(id, usuarioActual)
- Verifica que esté pausado
- Establece temporizador_activo = true
- Registra nuevo fecha_inicio_temporizador

obtenerTiempoEmpleado(id)
- Calcula tiempo total (guardado + tiempo actual si está activo)
- Retorna formato HH:MM:SS

formatearTiempo(segundos) [privado]
- Convierte segundos a formato HH:MM:SS
```

### 4. Controlador `peticion.controller.ts`
**Métodos nuevos:**
```typescript
pausarTemporizador(req, res)
reanudarTemporizador(req, res)
obtenerTiempoEmpleado(req, res)
```

### 5. Rutas `peticion.routes.ts`
**Nuevos endpoints:**
```typescript
POST /peticiones/:id/pausar-temporizador
POST /peticiones/:id/reanudar-temporizador
GET  /peticiones/:id/tiempo-empleado
```

### 6. WebSocket Service
- Modificado `emitPeticionAceptada()` para aceptar `fecha_limite: Date | null`

---

## 💾 MIGRACIÓN DE BASE DE DATOS

**Archivo:** `Backend/src/scripts/add-temporizador-peticiones.sql`

**⚠️ EJECUTAR ANTES DE INICIAR EL BACKEND:**

```bash
mysql -u root -p nombre_base_datos < Backend/src/scripts/add-temporizador-peticiones.sql
```

**Acciones del script:**
1. Elimina columnas: `tiempo_limite_horas`, `fecha_limite`
2. Agrega columnas: `tiempo_empleado_segundos`, `temporizador_activo`, `fecha_inicio_temporizador`, `fecha_pausa_temporizador`
3. Actualiza peticiones existentes "En Progreso" para iniciar su temporizador

---

## 💻 FRONTEND - Cambios Realizados

### 1. Modelo `peticion.model.ts` (Front/src/app/core/models/)
**Campos eliminados:**
```typescript
tiempo_limite_horas?: number | null
fecha_limite?: Date | null
```

**Campos agregados:**
```typescript
tiempo_empleado_segundos: number
temporizador_activo: boolean
fecha_inicio_temporizador?: Date | null
fecha_pausa_temporizador?: Date | null
```

**Interfaces actualizadas:**
```typescript
// PeticionCreate - Ya NO tiene tiempo_limite_horas
interface PeticionCreate {
  cliente_id: number;
  categoria_id: number;
  descripcion: string;
  descripcion_extra?: string;
  costo?: number;
  // tiempo_limite_horas ELIMINADO
}

// PeticionAceptar - Ahora vacío
interface PeticionAceptar {
  // Ya no necesita tiempo_limite_horas
}

// Nueva interfaz para tiempo empleado
interface TiempoEmpleado {
  tiempo_empleado_segundos: number;
  tiempo_empleado_formato: string; // HH:MM:SS
  temporizador_activo: boolean;
}
```

### 2. Servicio `peticion.service.ts` (Front/src/app/core/services/)
**Método modificado:**
```typescript
accept(id: number): Observable<ApiResponse<Peticion>> 
// Ya NO requiere parámetro data
```

**Métodos nuevos:**
```typescript
pausarTemporizador(id: number): Observable<ApiResponse<Peticion>>
reanudarTemporizador(id: number): Observable<ApiResponse<Peticion>>
obtenerTiempoEmpleado(id: number): Observable<ApiResponse<TiempoEmpleado>>
```

### 3. Constantes API `api.constants.ts`
**Endpoints agregados:**
```typescript
PETICIONES: {
  // ... existentes
  PAUSAR_TEMPORIZADOR: (id: number) => `${apiUrl}/peticiones/${id}/pausar-temporizador`,
  REANUDAR_TEMPORIZADOR: (id: number) => `${apiUrl}/peticiones/${id}/reanudar-temporizador`,
  TIEMPO_EMPLEADO: (id: number) => `${apiUrl}/peticiones/${id}/tiempo-empleado`,
}
```

---

## 📝 PENDIENTE POR IMPLEMENTAR (FRONTEND)

### 1. Actualizar Componente `aceptar-peticion.component.ts`

**Archivo:** `Front/src/app/features/peticiones/components/aceptar-peticion/aceptar-peticion.component.ts`

**Cambios necesarios:**

```typescript
// ANTES (ELIMINAR):
form = this.fb.group({
  tiempo_limite_horas: [null, [Validators.required, Validators.min(1)]]
});

aceptar() {
  this.peticionService.accept(this.peticionId, {
    tiempo_limite_horas: this.form.value.tiempo_limite_horas
  }).subscribe(...)
}

// DESPUÉS (NUEVO):
aceptar() {
  // Ya no necesita formulario ni datos
  this.peticionService.accept(this.peticionId).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Petición Aceptada',
        detail: 'El temporizador ha iniciado automáticamente'
      });
      this.dialogRef.close(true);
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.error.message
      });
    }
  });
}
```

**Template (aceptar-peticion.component.html):**
```html
<!-- ELIMINAR todo el formulario de tiempo límite -->
<!-- ANTES: -->
<div class="form-group">
  <label>Tiempo Límite (horas) *</label>
  <input type="number" formControlName="tiempo_limite_horas" />
  <small>Tiempo estimado: {{ calcularTiempoEstimado() }}</small>
</div>

<!-- DESPUÉS: -->
<div class="info-message">
  <i class="pi pi-info-circle"></i>
  <p>Al aceptar esta petición, el temporizador iniciará automáticamente.</p>
  <p>Podrás pausarlo y reanudarlo cuando lo necesites.</p>
</div>
```

---

### 2. Crear Componente de Temporizador Visual

**Archivo a crear:** `Front/src/app/shared/components/temporizador-peticion/temporizador-peticion.component.ts`

```typescript
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeticionService } from '@core/services/peticion.service';
import { ButtonModule } from 'primeng/button';
import { interval, Subscription } from 'rxjs';
import { MessageService } from 'primeng/message';

@Component({
  selector: 'app-temporizador-peticion',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="temporizador-container" [class.activo]="temporizadorActivo">
      <div class="temporizador-display">
        <i class="pi" [class.pi-clock]="temporizadorActivo" [class.pi-pause]="!temporizadorActivo"></i>
        <span class="tiempo">{{ tiempoFormateado }}</span>
      </div>
      
      <div class="temporizador-controls">
        <p-button 
          *ngIf="temporizadorActivo"
          icon="pi pi-pause"
          label="Pausar"
          severity="warning"
          (onClick)="pausar()"
          [loading]="loading"
        ></p-button>
        
        <p-button 
          *ngIf="!temporizadorActivo"
          icon="pi pi-play"
          label="Reanudar"
          severity="success"
          (onClick)="reanudar()"
          [loading]="loading"
        ></p-button>
      </div>
    </div>
  `,
  styles: [`
    .temporizador-container {
      padding: 1.5rem;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea15, #764ba215);
      border: 2px solid #e0e7ff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .temporizador-container.activo {
      border-color: #10b981;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { border-color: #10b981; }
      50% { border-color: #34d399; }
    }

    .temporizador-display {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .temporizador-display i {
      font-size: 2rem;
      color: var(--primary-color);
    }

    .tiempo {
      font-size: 2.5rem;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      color: var(--text-color);
    }

    .temporizador-controls {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class TemporizadorPeticionComponent implements OnInit, OnDestroy {
  @Input() peticionId!: number;
  
  tiempoEmpleadoSegundos: number = 0;
  temporizadorActivo: boolean = false;
  tiempoFormateado: string = '00:00:00';
  loading: boolean = false;
  
  private subscription?: Subscription;
  private actualizacionSubscription?: Subscription;

  constructor(
    private peticionService: PeticionService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cargarTiempoEmpleado();
    
    // Actualizar cada segundo si está activo
    this.actualizacionSubscription = interval(1000).subscribe(() => {
      if (this.temporizadorActivo) {
        this.tiempoEmpleadoSegundos++;
        this.actualizarTiempoFormateado();
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.actualizacionSubscription?.unsubscribe();
  }

  cargarTiempoEmpleado() {
    this.peticionService.obtenerTiempoEmpleado(this.peticionId).subscribe({
      next: (response) => {
        this.tiempoEmpleadoSegundos = response.data.tiempo_empleado_segundos;
        this.temporizadorActivo = response.data.temporizador_activo;
        this.tiempoFormateado = response.data.tiempo_empleado_formato;
      },
      error: (error) => console.error('Error al cargar tiempo empleado:', error)
    });
  }

  pausar() {
    this.loading = true;
    this.peticionService.pausarTemporizador(this.peticionId).subscribe({
      next: (response) => {
        this.temporizadorActivo = false;
        this.loading = false;
        this.messageService.add({
          severity: 'info',
          summary: 'Temporizador Pausado',
          detail: 'El temporizador se ha pausado correctamente'
        });
        this.cargarTiempoEmpleado();
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message
        });
      }
    });
  }

  reanudar() {
    this.loading = true;
    this.peticionService.reanudarTemporizador(this.peticionId).subscribe({
      next: (response) => {
        this.temporizadorActivo = true;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Temporizador Reanudado',
          detail: 'El temporizador se ha reanudado correctamente'
        });
        this.cargarTiempoEmpleado();
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message
        });
      }
    });
  }

  private actualizarTiempoFormateado() {
    const horas = Math.floor(this.tiempoEmpleadoSegundos / 3600);
    const minutos = Math.floor((this.tiempoEmpleadoSegundos % 3600) / 60);
    const segundos = this.tiempoEmpleadoSegundos % 60;
    
    this.tiempoFormateado = 
      `${horas.toString().padStart(2, '0')}:` +
      `${minutos.toString().padStart(2, '0')}:` +
      `${segundos.toString().padStart(2, '0')}`;
  }
}
```

---

### 3. Integrar Temporizador en Vista de Petición

**En el componente de detalle de petición (donde se muestra la información de una petición):**

```typescript
// detalle-peticion.component.html
<div class="peticion-detalle">
  <!-- Información general... -->
  
  <!-- Mostrar temporizador si la petición está "En Progreso" -->
  <div class="seccion-temporizador" *ngIf="peticion.estado === 'En Progreso'">
    <h3>⏱️ Tiempo Empleado</h3>
    <app-temporizador-peticion [peticionId]="peticion.id"></app-temporizador-peticion>
  </div>
  
  <!-- Mostrar tiempo total si está resuelta/cancelada -->
  <div class="tiempo-total" *ngIf="peticion.estado === 'Resuelta' || peticion.estado === 'Cancelada'">
    <i class="pi pi-check-circle"></i>
    <span>Tiempo total empleado: {{ formatearTiempo(peticion.tiempo_empleado_segundos) }}</span>
  </div>
</div>
```

---

## ✅ VERIFICACIÓN DE IMPLEMENTACIÓN

### Backend ✅
- [x] Modelo Peticion actualizado
- [x] Modelo PeticionHistorico actualizado
- [x] Servicio con métodos pausar/reanudar/obtenerTiempo
- [x] Controlador con endpoints
- [x] Rutas registradas
- [x] WebSocket service actualizado
- [x] Migración SQL creada

### Frontend ✅
- [x] Modelo peticion.model.ts actualizado
- [x] Servicio peticion.service.ts actualizado
- [x] Constantes API actualizadas

### Frontend ⚠️ PENDIENTE
- [ ] Actualizar componente aceptar-peticion
- [ ] Crear componente temporizador-peticion
- [ ] Integrar temporizador en vistas de peticiones
- [ ] Actualizar tablas para mostrar "Tiempo Empleado" en lugar de "Tiempo Restante"
- [ ] Ejecutar migración SQL en base de datos

---

## 🚀 PASOS PARA COMPLETAR LA IMPLEMENTACIÓN

1. **Ejecutar migración SQL:**
   ```bash
   mysql -u root -p nombre_bd < Backend/src/scripts/add-temporizador-peticiones.sql
   ```

2. **Reiniciar backend:**
   ```bash
   cd Backend
   npm run dev
   ```

3. **Actualizar componente de aceptar petición** (eliminar input de tiempo límite)

4. **Crear componente de temporizador** (copiar el código proporcionado arriba)

5. **Integrar temporizador en vistas de peticiones**

6. **Probar funcionalidad:**
   - Aceptar una petición → verificar que el temporizador inicie automáticamente
   - Pausar temporizador → verificar que se detenga y guarde el tiempo
   - Reanudar temporizador → verificar que continúe desde donde se pausó
   - Marcar como resuelta → verificar que se guarde el tiempo total empleado

---

## 📊 FLUJO DEL TEMPORIZADOR

```
1. Usuario acepta petición
   ↓
2. Backend inicia temporizador automáticamente
   - temporizador_activo = true
   - fecha_inicio_temporizador = now()
   - tiempo_empleado_segundos = 0
   ↓
3. Usuario trabaja en la petición
   ↓
4. Usuario pausa (si necesita hacer otra cosa)
   - Calcula tiempo transcurrido
   - Suma a tiempo_empleado_segundos
   - temporizador_activo = false
   - fecha_pausa_temporizador = now()
   ↓
5. Usuario reanuda
   - temporizador_activo = true
   - fecha_inicio_temporizador = now()
   ↓
6. Usuario marca como resuelta
   - Si temporizador está activo, se pausa automáticamente
   - Guarda tiempo_empleado_segundos final
   - Mueve a histórico con el tiempo total
```

---

## 📞 SOPORTE

Si encuentras errores durante la implementación:
1. Verificar que la migración SQL se ejecutó correctamente
2. Verificar que el backend compile sin errores
3. Verificar que los endpoints estén respondiendo
4. Revisar consola del navegador para errores de frontend

