import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { RoleEnum } from '../../../../core/models/role.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioAuth } from '../../../../core/models/auth.model';
import { InitialsPipe } from '../../../pipes/initials.pipe';

interface MenuItemCustom {
  label: string;
  icon: string;
  routerLink?: string[];
  items?: MenuItemCustom[]; // Esto debe ser opcional
  separator?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, InitialsPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItemCustom[] = [];
  currentUser: UsuarioAuth | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Cerrar sidebar en móvil si es necesario
      });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
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
        routerLink: ['/dashboard'],
      },
      {
        label: 'Peticiones',
        icon: 'pi pi-file-edit',
        expanded: false,
        items: [
          {
            label: 'Todas',
            icon: 'pi pi-list',
            routerLink: ['/peticiones'],
          },
          {
            label: 'Crear Nueva',
            icon: 'pi pi-plus-circle',
            routerLink: ['/peticiones/crear-nueva'],
          },
          {
            label: 'Pendientes',
            icon: 'pi pi-clock',
            routerLink: ['/peticiones/pendientes'],
          },
          {
            label: 'En Progreso',
            icon: 'pi pi-sync',
            routerLink: ['/peticiones/en-progreso'],
          },
          {
            label: 'Histórico',
            icon: 'pi pi-history',
            routerLink: ['/peticiones/historico'],
          },
        ],
      },
      {
        label: 'Clientes',
        icon: 'pi pi-users',
        expanded: false,
        items: [
          {
            label: 'Todos',
            icon: 'pi pi-list',
            routerLink: ['/clientes'],
          },
          ...(this.canCreateClients()
            ? [
                {
                  label: 'Crear Nuevo',
                  icon: 'pi pi-user-plus',
                  routerLink: ['/clientes/crear'],
                },
              ]
            : []),
        ],
      },
    ];

    // Agregar Usuarios
    if (
      [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER].includes(
        this.currentUser.rol
      )
    ) {
      this.menuItems.push({
        label: 'Usuarios',
        icon: 'pi pi-id-card',
        expanded: false,
        items: [
          {
            label: 'Todos',
            icon: 'pi pi-list',
            routerLink: ['/usuarios'],
          },
          ...(this.currentUser.rol === RoleEnum.ADMIN
            ? [
                {
                  label: 'Crear Nuevo',
                  icon: 'pi pi-user-plus',
                  routerLink: ['/usuarios/crear'],
                },
              ]
            : []),
        ],
      });
    }

    // Agregar Estadísticas
    this.menuItems.push({
      label: 'Estadísticas',
      icon: 'pi pi-chart-line',
      expanded: false,
      items: [
        {
          label: 'Mis Estadísticas',
          icon: 'pi pi-chart-bar',
          routerLink: ['/estadisticas/mis-estadisticas'],
        },
        ...(this.canViewAreaStats()
          ? [
              {
                label: 'Por Área',
                icon: 'pi pi-building',
                routerLink: ['/estadisticas/area'],
              },
            ]
          : []),
        ...(this.currentUser.rol === RoleEnum.ADMIN
          ? [
              {
                label: 'Globales',
                icon: 'pi pi-globe',
                routerLink: ['/estadisticas/globales'],
              },
            ]
          : []),
      ],
    });

    // Agregar Facturación
    if ([RoleEnum.ADMIN, RoleEnum.DIRECTIVO].includes(this.currentUser.rol)) {
      this.menuItems.push({
        label: 'Facturación',
        icon: 'pi pi-wallet',
        expanded: false,
        items: [
          {
            label: 'Resumen',
            icon: 'pi pi-list',
            routerLink: ['/facturacion/resumen'],
          },
          {
            label: 'Generar',
            icon: 'pi pi-plus-circle',
            routerLink: ['/facturacion/generar'],
          },
        ],
      });
    }

    // Agregar Configuración
    if (this.currentUser.rol === RoleEnum.ADMIN) {
      this.menuItems.push({
        separator: true,
        label: '',
        icon: '',
      });
      this.menuItems.push({
        label: 'Configuración',
        icon: 'pi pi-cog',
        routerLink: ['/configuracion'],
      });
    }
  }

  toggleMenu(item: MenuItemCustom): void {
    if (item.items && item.items.length > 0) {
      item.expanded = !item.expanded;
    }
  }

  hasChildren(item: MenuItemCustom): boolean {
    return !!item.items && item.items.length > 0;
  }

  canCreateClients(): boolean {
    if (!this.currentUser) return false;
    return [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER].includes(
      this.currentUser.rol
    );
  }

  canViewAreaStats(): boolean {
    if (!this.currentUser) return false;
    return [RoleEnum.ADMIN, RoleEnum.DIRECTIVO, RoleEnum.LIDER].includes(
      this.currentUser.rol
    );
  }
}
