import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RoleEnum } from '../../../../core/models/role.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioAuth } from '../../../../core/models/auth.model';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PanelMenuModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  currentUser: UsuarioAuth | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.buildMenu();
    });
  }

  buildMenu(): void {
    if (!this.currentUser) return;

    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/dashboard']
      },
      {
        label: 'Peticiones',
        icon: 'pi pi-file',
        items: [
          {
            label: 'Todas',
            icon: 'pi pi-list',
            routerLink: ['/peticiones']
          },
          {
            label: 'Crear Nueva',
            icon: 'pi pi-plus',
            routerLink: ['/peticiones/crear']
          },
          {
            label: 'Pendientes',
            icon: 'pi pi-clock',
            routerLink: ['/peticiones/pendientes']
          },
          {
            label: 'En Progreso',
            icon: 'pi pi-spin pi-spinner',
            routerLink: ['/peticiones/en-progreso']
          },
          {
            label: 'Histórico',
            icon: 'pi pi-history',
            routerLink: ['/peticiones/historico']
          }
        ]
      },
      {
        label: 'Clientes',
        icon: 'pi pi-users',
        items: [
          {
            label: 'Todos',
            icon: 'pi pi-list',
            routerLink: ['/clientes']
          },
          ...(this.canCreateClients() ? [{
            label: 'Crear Nuevo',
            icon: 'pi pi-plus',
            routerLink: ['/clientes/crear']
          }] : [])
        ]
      }
    ];

    // Agregar Usuarios (solo Admin, Directivo, Líder)
    if ([RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER].includes(this.currentUser.rol)) {
      this.menuItems.push({
        label: 'Usuarios',
        icon: 'pi pi-user',
        items: [
          {
            label: 'Todos',
            icon: 'pi pi-list',
            routerLink: ['/usuarios']
          },
          ...(this.currentUser.rol === RoleEnum.ADMIN ? [{
            label: 'Crear Nuevo',
            icon: 'pi pi-user-plus',
            routerLink: ['/usuarios/crear']
          }] : [])
        ]
      });
    }

    // Agregar Estadísticas
    this.menuItems.push({
      label: 'Estadísticas',
      icon: 'pi pi-chart-bar',
      items: [
        {
          label: 'Mis Estadísticas',
          icon: 'pi pi-chart-line',
          routerLink: ['/estadisticas/mis-estadisticas']
        },
        ...(this.canViewAreaStats() ? [{
          label: 'Por Área',
          icon: 'pi pi-building',
          routerLink: ['/estadisticas/area']
        }] : []),
        ...(this.currentUser.rol === RoleEnum.ADMIN ? [{
          label: 'Globales',
          icon: 'pi pi-globe',
          routerLink: ['/estadisticas/globales']
        }] : [])
      ]
    });

    // Agregar Facturación (solo Admin y Directivo)
    if ([RoleEnum.ADMIN, RoleEnum.DIRECTIVO].includes(this.currentUser.rol)) {
      this.menuItems.push({
        label: 'Facturación',
        icon: 'pi pi-dollar',
        items: [
          {
            label: 'Resumen',
            icon: 'pi pi-list',
            routerLink: ['/facturacion']
          },
          {
            label: 'Generar',
            icon: 'pi pi-plus',
            routerLink: ['/facturacion/generar']
          }
        ]
      });
    }

    // Agregar Configuración (solo Admin)
    if (this.currentUser.rol === RoleEnum.ADMIN) {
      this.menuItems.push({
        separator: true
      });
      this.menuItems.push({
        label: 'Configuración',
        icon: 'pi pi-cog',
        routerLink: ['/configuracion']
      });
    }
  }

  canCreateClients(): boolean {
    if (!this.currentUser) return false;
    return [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER].includes(this.currentUser.rol);
  }

  canViewAreaStats(): boolean {
    if (!this.currentUser) return false;
    return [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER].includes(this.currentUser.rol);
  }
}
