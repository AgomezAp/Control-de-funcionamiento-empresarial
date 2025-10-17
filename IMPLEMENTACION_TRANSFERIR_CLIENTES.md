# Implementación: Sistema de Transferencia de Clientes

## 📋 Descripción

Sistema que permite a **Administradores**, **Directivos** y **Líderes** transferir clientes de un pautador a otro, o cambiar el diseñador asignado. Útil cuando un empleado se va de vacaciones, renuncia, o hay redistribución de cargas de trabajo.

---

## 🎯 Funcionalidades

- ✅ Ver todos los clientes agrupados por pautador
- ✅ Selección múltiple de clientes para transferir
- ✅ Cambiar pautador y/o diseñador
- ✅ Validaciones de permisos (Solo Admin, Directivo, Líder)
- ✅ Registro en auditoría de cada transferencia
- ✅ Confirmación antes de transferir

---

## 🔧 Implementación Backend

### 1. Servicio de Clientes

**Archivo:** `Backend/src/services/cliente.service.ts`

**Agregar al final de la clase (antes del `}` final):**

```typescript
  async transferirClientes(data: {
    cliente_ids: number[];
    nuevo_pautador_id?: number;
    nuevo_disenador_id?: number;
  }, usuarioActual: any) {
    const { cliente_ids, nuevo_pautador_id, nuevo_disenador_id } = data;

    if (!nuevo_pautador_id && !nuevo_disenador_id) {
      throw new ValidationError("Debe especificar al menos un pautador o diseñador nuevo");
    }

    if (!cliente_ids || cliente_ids.length === 0) {
      throw new ValidationError("Debe seleccionar al menos un cliente para transferir");
    }

    if (nuevo_pautador_id) {
      const nuevoPautador = await Usuario.findByPk(nuevo_pautador_id, {
        include: [{ model: Area, as: "area" }],
      });

      if (!nuevoPautador) {
        throw new NotFoundError("El nuevo pautador especificado no existe");
      }

      if ((nuevoPautador as any).area.nombre !== "Pautas") {
        throw new ValidationError("El usuario asignado como pautador no pertenece al área de Pautas");
      }
    }

    if (nuevo_disenador_id) {
      const nuevoDisenador = await Usuario.findByPk(nuevo_disenador_id, {
        include: [{ model: Area, as: "area" }],
      });

      if (!nuevoDisenador) {
        throw new NotFoundError("El nuevo diseñador especificado no existe");
      }

      if ((nuevoDisenador as any).area.nombre !== "Diseño") {
        throw new ValidationError("El usuario asignado como diseñador no pertenece al área de Diseño");
      }
    }

    const clientes = await Cliente.findAll({
      where: { id: cliente_ids },
      include: [
        { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo"] },
        { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo"] },
      ],
    });

    if (clientes.length === 0) {
      throw new NotFoundError("No se encontraron los clientes especificados");
    }

    if (clientes.length !== cliente_ids.length) {
      throw new ValidationError("Algunos de los clientes especificados no existen");
    }

    for (const cliente of clientes) {
      const cambios: any = {};
      const descripciones = [];

      const pautadorAnterior = (cliente as any).pautador?.nombre_completo || 'N/A';
      const disenadorAnterior = (cliente as any).disenador?.nombre_completo || 'N/A';

      if (nuevo_pautador_id && cliente.pautador_id !== nuevo_pautador_id) {
        cambios.pautador_id = nuevo_pautador_id;
        descripciones.push(`Pautador cambiado de ${pautadorAnterior} a nuevo pautador`);
      }

      if (nuevo_disenador_id && cliente.disenador_id !== nuevo_disenador_id) {
        cambios.disenador_id = nuevo_disenador_id;
        descripciones.push(`Diseñador cambiado de ${disenadorAnterior} a nuevo diseñador`);
      }

      if (Object.keys(cambios).length > 0) {
        await cliente.update(cambios);

        await this.auditoriaService.registrarCambio({
          tabla_afectada: "clientes",
          registro_id: cliente.id,
          tipo_cambio: "UPDATE",
          campo_modificado: "transferencia",
          valor_anterior: JSON.stringify({ pautador_id: cliente.pautador_id, disenador_id: cliente.disenador_id }),
          valor_nuevo: JSON.stringify(cambios),
          usuario_id: usuarioActual.uid,
          descripcion: `Transferencia: ${descripciones.join(', ')}`,
        });
      }
    }

    return await Cliente.findAll({
      where: { id: cliente_ids },
      include: [
        { model: Usuario, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
        { model: Usuario, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
      ],
    });
  }
```

---

### 2. Controlador de Clientes

**Archivo:** `Backend/src/controllers/cliente.controller.ts`

**Agregar al final de la clase (antes del `}` final):**

```typescript
  async transferirClientes(req: Request, res: Response) {
    try {
      const { cliente_ids, nuevo_pautador_id, nuevo_disenador_id } = req.body;
      const usuarioActual = (req as any).usuario;

      const clientes = await clienteService.transferirClientes(
        { cliente_ids, nuevo_pautador_id, nuevo_disenador_id },
        usuarioActual
      );

      return ApiResponse.success(
        res,
        clientes,
        `${clientes.length} cliente(s) transferido(s) exitosamente`
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al transferir clientes",
        error.statusCode || 500
      );
    }
  }
```

---

### 3. Rutas de Clientes

**Archivo:** `Backend/src/routes/cliente.routes.ts`

**Agregar esta ruta:**

```typescript
// Transferir clientes (Solo Admin, Directivo, Líder)
router.post(
  "/transferir",
  authenticateToken,
  requireRoles([RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]),
  clienteController.transferirClientes.bind(clienteController)
);
```

**Ubicación:** Agregar después de las rutas de crear/actualizar, antes de las rutas con `:id`

---

## 🎨 Implementación Frontend

### 4. Servicio de Clientes (Frontend)

**Archivo:** `Front/src/app/core/services/cliente.service.ts`

**Agregar interface:**

```typescript
export interface TransferirClientesRequest {
  cliente_ids: number[];
  nuevo_pautador_id?: number;
  nuevo_disenador_id?: number;
}
```

**Agregar método:**

```typescript
transferirClientes(data: TransferirClientesRequest): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/transferir`, data);
}
```

---

### 5. Componente Transferir Clientes

**Archivo:** `Front/src/app/features/clientes/components/transferir-clientes/transferir-clientes.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

// Services
import { ClienteService } from '../../../../core/services/cliente.service';
import { UsuarioService } from '../../../../core/services/usuario.service';

// Models
import { Cliente } from '../../../../core/models/cliente.model';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-transferir-clientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './transferir-clientes.component.html',
  styleUrls: ['./transferir-clientes.component.css'],
})
export class TransferirClientesComponent implements OnInit {
  form: FormGroup;
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  clientesSeleccionados: Cliente[] = [];
  pautadores: Usuario[] = [];
  disenadores: Usuario[] = [];
  loading = false;
  transfering = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.fb.group({
      pautador_filtro: [null],
      nuevo_pautador_id: [null],
      nuevo_disenador_id: [null],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Cargar clientes
    this.clienteService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientes = response.data;
          this.clientesFiltrados = this.clientes;
        }
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
        });
      },
    });

    // Cargar usuarios del área de Pautas
    this.usuarioService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.pautadores = response.data.filter((u: Usuario) => u.area?.nombre === 'Pautas');
          this.disenadores = response.data.filter((u: Usuario) => u.area?.nombre === 'Diseño');
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.loading = false;
      },
    });
  }

  onPautadorFiltroChange(event: any): void {
    const pautadorId = event.value;
    if (pautadorId) {
      this.clientesFiltrados = this.clientes.filter(c => c.pautador_id === pautadorId);
    } else {
      this.clientesFiltrados = this.clientes;
    }
    this.clientesSeleccionados = [];
  }

  transferir(): void {
    const nuevoPautadorId = this.form.value.nuevo_pautador_id;
    const nuevoDisenadorId = this.form.value.nuevo_disenador_id;

    if (!nuevoPautadorId && !nuevoDisenadorId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos un pautador o diseñador nuevo',
      });
      return;
    }

    if (this.clientesSeleccionados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos un cliente para transferir',
      });
      return;
    }

    const mensajeConfirmacion = this.construirMensajeConfirmacion(nuevoPautadorId, nuevoDisenadorId);

    this.confirmationService.confirm({
      message: mensajeConfirmacion,
      header: 'Confirmar Transferencia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, transferir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.ejecutarTransferencia(nuevoPautadorId, nuevoDisenadorId);
      },
    });
  }

  construirMensajeConfirmacion(nuevoPautadorId: number, nuevoDisenadorId: number): string {
    const count = this.clientesSeleccionados.length;
    let mensaje = `¿Está seguro de transferir ${count} cliente(s)?<br><br>`;

    if (nuevoPautadorId) {
      const pautador = this.pautadores.find(p => p.uid === nuevoPautadorId);
      mensaje += `• Nuevo pautador: ${pautador?.nombre_completo}<br>`;
    }

    if (nuevoDisenadorId) {
      const disenador = this.disenadores.find(d => d.uid === nuevoDisenadorId);
      mensaje += `• Nuevo diseñador: ${disenador?.nombre_completo}`;
    }

    return mensaje;
  }

  ejecutarTransferencia(nuevoPautadorId: number, nuevoDisenadorId: number): void {
    this.transfering = true;

    const clienteIds = this.clientesSeleccionados.map(c => c.id);

    this.clienteService
      .transferirClientes({
        cliente_ids: clienteIds,
        nuevo_pautador_id: nuevoPautadorId,
        nuevo_disenador_id: nuevoDisenadorId,
      })
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.message || 'Clientes transferidos exitosamente',
          });
          this.transfering = false;
          this.form.reset();
          this.clientesSeleccionados = [];
          this.loadData();
        },
        error: (error) => {
          console.error('Error al transferir clientes:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'No se pudieron transferir los clientes',
          });
          this.transfering = false;
        },
      });
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }
}
```

---

### 6. Template HTML

**Archivo:** `Front/src/app/features/clientes/components/transferir-clientes/transferir-clientes.component.html`

```html
<div class="transferir-clientes-container">
  <p-toast></p-toast>
  <p-confirmDialog></p-confirmDialog>

  <!-- Header -->
  <div class="page-header">
    <button
      pButton
      icon="pi pi-arrow-left"
      label="Volver"
      class="p-button-text"
      (click)="volver()"
    ></button>
    <h2><i class="pi pi-users"></i> Transferir Clientes</h2>
  </div>

  <!-- Filtros y Selección -->
  <p-card>
    <ng-template pTemplate="header">
      <div class="card-header">
        <h3>Selección y Filtros</h3>
      </div>
    </ng-template>

    <form [formGroup]="form">
      <div class="form-grid">
        <!-- Filtrar por pautador -->
        <div class="field">
          <label for="pautador_filtro">Filtrar por Pautador Actual</label>
          <p-dropdown
            id="pautador_filtro"
            formControlName="pautador_filtro"
            [options]="pautadores"
            optionLabel="nombre_completo"
            optionValue="uid"
            placeholder="Todos los pautadores"
            [showClear]="true"
            (onChange)="onPautadorFiltroChange($event)"
          ></p-dropdown>
        </div>

        <!-- Nuevo pautador -->
        <div class="field">
          <label for="nuevo_pautador">Transferir a Pautador</label>
          <p-dropdown
            id="nuevo_pautador"
            formControlName="nuevo_pautador_id"
            [options]="pautadores"
            optionLabel="nombre_completo"
            optionValue="uid"
            placeholder="Seleccione nuevo pautador"
            [showClear]="true"
          ></p-dropdown>
        </div>

        <!-- Nuevo diseñador -->
        <div class="field">
          <label for="nuevo_disenador">Cambiar Diseñador</label>
          <p-dropdown
            id="nuevo_disenador"
            formControlName="nuevo_disenador_id"
            [options]="disenadores"
            optionLabel="nombre_completo"
            optionValue="uid"
            placeholder="Seleccione nuevo diseñador"
            [showClear]="true"
          ></p-dropdown>
        </div>
      </div>
    </form>
  </p-card>

  <!-- Tabla de Clientes -->
  <p-card class="mt-4">
    <ng-template pTemplate="header">
      <div class="card-header">
        <h3>Clientes ({{clientesFiltrados.length}})</h3>
        <p-tag *ngIf="clientesSeleccionados.length > 0" 
               [value]="clientesSeleccionados.length + ' seleccionados'" 
               severity="info"></p-tag>
      </div>
    </ng-template>

    <p-table
      [value]="clientesFiltrados"
      [(selection)]="clientesSeleccionados"
      [paginator]="true"
      [rows]="10"
      [loading]="loading"
      styleClass="p-datatable-sm"
    >
      <ng-template pTemplate="header">
        <tr>
          <th style="width: 4rem">
            <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
          </th>
          <th>Cliente</th>
          <th>País</th>
          <th>Pautador Actual</th>
          <th>Diseñador Actual</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-cliente>
        <tr>
          <td>
            <p-tableCheckbox [value]="cliente"></p-tableCheckbox>
          </td>
          <td>
            <strong>{{ cliente.nombre }}</strong>
          </td>
          <td>{{ cliente.pais }}</td>
          <td>
            <p-tag [value]="cliente.pautador?.nombre_completo || 'N/A'" severity="info"></p-tag>
          </td>
          <td>
            <p-tag [value]="cliente.disenador?.nombre_completo || 'N/A'" severity="success"></p-tag>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="5" class="text-center">
            <p>No hay clientes que coincidan con el filtro</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </p-card>

  <!-- Botón de transferencia -->
  <div class="actions-footer">
    <button
      pButton
      label="Transferir Clientes Seleccionados"
      icon="pi pi-arrow-right-arrow-left"
      class="p-button-success"
      [loading]="transfering"
      [disabled]="clientesSeleccionados.length === 0"
      (click)="transferir()"
    ></button>
  </div>
</div>
```

---

### 7. Estilos CSS

**Archivo:** `Front/src/app/features/clientes/components/transferir-clientes/transferir-clientes.component.css`

```css
.transferir-clientes-container {
  padding: 2rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.card-header h3 {
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.actions-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.mt-4 {
  margin-top: 2rem;
}

.text-center {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}
```

---

### 8. Agregar Ruta

**Archivo:** `Front/src/app/app.routes.ts`

**Agregar en la sección de rutas de clientes:**

```typescript
{
  path: 'transferir',
  component: TransferirClientesComponent,
  canActivate: [AuthGuard],
  data: { 
    roles: [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER] 
  },
},
```

---

### 9. Botón en Lista de Clientes

**Archivo:** `Front/src/app/features/clientes/components/lista-clientes/lista-clientes.component.html`

**Agregar botón en el toolbar (después del botón "Crear Cliente"):**

```html
<button
  pButton
  label="Transferir Clientes"
  icon="pi pi-arrow-right-arrow-left"
  class="p-button-warning"
  (click)="transferirClientes()"
  *hasRole="[RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER]"
></button>
```

**Archivo:** `Front/src/app/features/clientes/components/lista-clientes/lista-clientes.component.ts`

**Agregar método:**

```typescript
transferirClientes(): void {
  this.router.navigate(['/clientes/transferir']);
}
```

---

## 🧪 Pruebas

### 1. Probar Permisos
- Login como Usuario (sin permisos) → No debe ver botón "Transferir Clientes"
- Login como Líder → Debe ver botón y acceder
- Login como Directivo → Debe ver botón y acceder
- Login como Admin → Debe ver botón y acceder

### 2. Probar Filtros
- Filtrar por un pautador específico
- Verificar que solo se muestran sus clientes

### 3. Probar Transferencia
- Seleccionar múltiples clientes
- Elegir nuevo pautador
- Confirmar transferencia
- Verificar que se actualizaron los clientes

### 4. Probar Validaciones
- Intentar transferir sin seleccionar clientes → Error
- Intentar transferir sin elegir pautador ni diseñador → Error
- Transferir a un usuario que no es pautador → Error del backend

---

## ✅ Checklist de Implementación

- [ ] Agregar método `transferirClientes()` a `cliente.service.ts` (backend)
- [ ] Agregar método `transferirClientes()` a `cliente.controller.ts`
- [ ] Agregar ruta POST `/transferir` en `cliente.routes.ts`
- [ ] Agregar método `transferirClientes()` al servicio frontend
- [ ] Crear componente `transferir-clientes`
- [ ] Agregar ruta en `app.routes.ts`
- [ ] Agregar botón en lista de clientes
- [ ] Probar con diferentes roles
- [ ] Probar transferencia de múltiples clientes
- [ ] Verificar registro en auditoría

---

**Fecha de creación:** 17 de octubre de 2025  
**Desarrollador:** GitHub Copilot  
**Estado:** ⚠️ Documentación completa - Pendiente implementación manual
