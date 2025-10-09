import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ClienteService } from '../../../../core/services/cliente.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { Cliente } from '../../../../core/models/cliente.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-detalle-cliente',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    SkeletonModule,
    TimeAgoPipe
  ],
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['./detalle-cliente.component.css']
})
export class DetalleClienteComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clienteId!: number;
  cliente?: Cliente;
  cargando = false;

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.clienteId) {
      this.notificacionService.error('ID de cliente inválido');
      this.volver();
      return;
    }
    
    this.cargarCliente();
  }

  cargarCliente(): void {
    this.cargando = true;
    this.clienteService.getById(this.clienteId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cliente = response.data;
        } else {
          this.notificacionService.error('Cliente no encontrado');
        }
      },
      error: (error) => {
        console.error('Error al cargar cliente:', error);
        this.notificacionService.error('Error al cargar los datos del cliente');
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  editar(): void {
    this.router.navigate(['/clientes', this.clienteId, 'editar']);
  }

  verPeticiones(): void {
    this.router.navigate(['/peticiones'], {
      queryParams: { cliente: this.clienteId }
    });
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }
}