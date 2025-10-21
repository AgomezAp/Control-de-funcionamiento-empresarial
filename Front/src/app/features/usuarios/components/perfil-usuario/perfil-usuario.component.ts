import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TabViewModule } from 'primeng/tabview';

// Services
import { UsuarioService } from '../../../../core/services/usuario.service';
import { EstadisticaService } from '../../../../core/services/estadistica.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { AuthService } from '../../../../core/services/auth.service';

// Models
import { Usuario } from '../../../../core/models/usuario.model';

// Pipes
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { LoaderComponent } from '../../../../shared/components/loader/loader/loader.component';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    SkeletonModule,
    TabViewModule,
    LoaderComponent,
    TimeAgoPipe,
  ],
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css'],
})
export class PerfilUsuarioComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private estadisticaService = inject(EstadisticaService);
  private notificacionService = inject(NotificacionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  activeTabIndex = 0;
  usuarioId!: number;
  usuario?: Usuario;
  estadisticas?: any;
  cargando = false;
  cargandoEstadisticas = false;
  tasaResolucion = 0;

  ngOnInit(): void {
    // Si viene un ID en la ruta, lo usamos (para ver perfil de otros usuarios)
    const idFromRoute = this.route.snapshot.paramMap.get('id');

    if (idFromRoute) {
      // Modo: Ver perfil de otro usuario
      this.usuarioId = Number(idFromRoute);
    } else {
      // Modo: Ver mi propio perfil
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.usuarioId = currentUser.uid;
      }
    }

    if (!this.usuarioId) {
      this.notificacionService.error('ID de usuario inválido');
      this.volver();
      return;
    }

    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.cargando = true;
    this.usuarioService.getById(this.usuarioId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.usuario = response.data;
        } else {
          this.notificacionService.error('Usuario no encontrado');
        }
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.notificacionService.error('Error al cargar los datos del usuario');
      },
      complete: () => {
        this.cargando = false;
      },
    });
  }

  cargarEstadisticas(): void {
    if (this.estadisticas || this.cargandoEstadisticas) return;

    this.cargandoEstadisticas = true;
    this.estadisticaService.getMisEstadisticas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.estadisticas = response.data;
          this.calcularTasaResolucion();
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      },
      complete: () => {
        this.cargandoEstadisticas = false;
      },
    });
  }
  onTabChange(event: any): void {
    if (event.index === 1) {
      // Índice 1 = Estadísticas
      this.cargarEstadisticas();
    }
  }
  calcularTasaResolucion(): void {
    if (this.estadisticas && this.estadisticas.totalPeticiones > 0) {
      this.tasaResolucion = Math.round(
        (this.estadisticas.peticionesResueltas /
          this.estadisticas.totalPeticiones) *
          100
      );
    }
  }

  editar(): void {
    this.router.navigate(['/usuarios', this.usuarioId, 'editar']);
  }

  volver(): void {
    // Si venimos de la ruta /perfil (mi perfil), volver al dashboard
    // Si venimos de /usuarios/:id, volver a la lista de usuarios
    const currentUrl = this.router.url;
    if (currentUrl.includes('/perfil')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/usuarios']);
    }
  }
}
