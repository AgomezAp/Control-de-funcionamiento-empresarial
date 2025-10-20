import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InitialsPipe } from '../../../pipes/initials.pipe';
import { UsuarioAuth } from '../../../../core/models/auth.model';
import { Observable } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { TemaService } from '../../../../core/services/tema.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

interface SearchResult {
  title: string;
  category: string;
  route: string;
  icon: string;
  keywords: string[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    MenuModule,
    BadgeModule,
    AvatarModule,
    TooltipModule,
  //  ClickOutsideDirective,
    InitialsPipe,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  currentUser: UsuarioAuth | null = null;
  isDarkMode$: Observable<boolean>;
  unreadCount$: Observable<number>;
  userMenuItems: MenuItem[] = [];

  // Búsqueda
  searchQuery = '';
  showSearchResults = false;
  selectedResultIndex = 0;
  filteredResults: SearchResult[] = [];

  // Catálogo completo de páginas/secciones del sistema
  searchableItems: SearchResult[] = [
    // Dashboard
    {
      title: 'Panel Principal',
      category: 'Dashboard',
      route: '/dashboard',
      icon: 'pi pi-home',
      keywords: ['inicio', 'panel', 'dashboard', 'principal', 'home']
    },
    
    // Peticiones
    {
      title: 'Mis Peticiones',
      category: 'Peticiones',
      route: '/peticiones/mis-peticiones',
      icon: 'pi pi-file',
      keywords: ['peticiones', 'mis', 'asignadas', 'trabajos', 'tareas']
    },
    {
      title: 'Crear Petición',
      category: 'Peticiones',
      route: '/peticiones/crear',
      icon: 'pi pi-plus-circle',
      keywords: ['crear', 'nueva', 'peticion', 'agregar', 'añadir']
    },
    {
      title: 'Histórico de Peticiones',
      category: 'Peticiones',
      route: '/peticiones/historico',
      icon: 'pi pi-history',
      keywords: ['historico', 'historial', 'anteriores', 'pasadas', 'resueltas']
    },
    
    // Clientes
    {
      title: 'Lista de Clientes',
      category: 'Clientes',
      route: '/clientes',
      icon: 'pi pi-users',
      keywords: ['clientes', 'lista', 'todos', 'empresas']
    },
    {
      title: 'Crear Cliente',
      category: 'Clientes',
      route: '/clientes/crear',
      icon: 'pi pi-user-plus',
      keywords: ['crear', 'nuevo', 'cliente', 'agregar', 'registrar']
    },
    
    // Facturación
    {
      title: 'Resumen de Facturación',
      category: 'Facturación',
      route: '/facturacion/resumen',
      icon: 'pi pi-dollar',
      keywords: ['facturacion', 'resumen', 'facturas', 'cobros', 'pagos']
    },
    {
      title: 'Generar Período',
      category: 'Facturación',
      route: '/facturacion/generar',
      icon: 'pi pi-calendar-plus',
      keywords: ['generar', 'periodo', 'nuevo', 'factura', 'mensual']
    },
    
    // Estadísticas
    {
      title: 'Mis Estadísticas',
      category: 'Estadísticas',
      route: '/estadisticas/mis-estadisticas',
      icon: 'pi pi-chart-line',
      keywords: ['estadisticas', 'mis', 'personales', 'rendimiento', 'metricas']
    },
    {
      title: 'Estadísticas Globales',
      category: 'Estadísticas',
      route: '/estadisticas/globales',
      icon: 'pi pi-chart-bar',
      keywords: ['estadisticas', 'globales', 'general', 'empresa', 'todos']
    },
    
    // Notificaciones
    {
      title: 'Notificaciones',
      category: 'Notificaciones',
      route: '/notificaciones',
      icon: 'pi pi-bell',
      keywords: ['notificaciones', 'alertas', 'avisos', 'mensajes']
    },
    
    // Perfil y Configuración
    {
      title: 'Mi Perfil',
      category: 'Usuario',
      route: '/perfil',
      icon: 'pi pi-user',
      keywords: ['perfil', 'mi', 'cuenta', 'datos', 'informacion']
    },
    {
      title: 'Configuración',
      category: 'Usuario',
      route: '/configuracion',
      icon: 'pi pi-cog',
      keywords: ['configuracion', 'ajustes', 'preferencias', 'opciones']
    },
    
    // Admin - Categorías
    {
      title: 'Gestión de Categorías',
      category: 'Administración',
      route: '/admin/categorias',
      icon: 'pi pi-tags',
      keywords: ['categorias', 'admin', 'gestionar', 'tipos', 'clasificacion']
    },
    
    // Admin - Usuarios (si aplica según permisos)
    {
      title: 'Gestión de Usuarios',
      category: 'Administración',
      route: '/admin/usuarios',
      icon: 'pi pi-users',
      keywords: ['usuarios', 'admin', 'gestionar', 'empleados', 'equipo']
    },
  ];

  constructor(
    private authService: AuthService,
    private temaService: TemaService,
    private notificacionService: NotificacionService,
    private router: Router
  ) {
    this.isDarkMode$ = this.temaService.isDarkMode$;
    this.unreadCount$ = this.notificacionService.unreadCount$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.setupUserMenu();
    });
  }

  // Atajo de teclado Ctrl+K para enfocar el buscador
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl+K o Cmd+K para enfocar el buscador
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }

    // ESC para cerrar resultados
    if (event.key === 'Escape') {
      this.showSearchResults = false;
      this.searchInput?.nativeElement.blur();
    }
  }

  // Búsqueda con filtrado inteligente
  onSearchChange(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredResults = [];
      this.showSearchResults = false;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    
    this.filteredResults = this.searchableItems.filter(item => {
      // Buscar en título
      if (item.title.toLowerCase().includes(query)) {
        return true;
      }
      
      // Buscar en categoría
      if (item.category.toLowerCase().includes(query)) {
        return true;
      }
      
      // Buscar en keywords
      return item.keywords.some(keyword => keyword.includes(query));
    });

    // Ordenar por relevancia (coincidencia exacta primero)
    this.filteredResults.sort((a, b) => {
      const aStartsWith = a.title.toLowerCase().startsWith(query);
      const bStartsWith = b.title.toLowerCase().startsWith(query);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });

    this.selectedResultIndex = 0;
    this.showSearchResults = true;
  }

  // Navegación con teclado (flechas arriba/abajo y Enter)
  onSearchKeyDown(event: KeyboardEvent): void {
    if (!this.showSearchResults || this.filteredResults.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedResultIndex = Math.min(
          this.selectedResultIndex + 1,
          this.filteredResults.length - 1
        );
        this.scrollToSelected();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedResultIndex = Math.max(this.selectedResultIndex - 1, 0);
        this.scrollToSelected();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.filteredResults[this.selectedResultIndex]) {
          this.navigateToResult(this.filteredResults[this.selectedResultIndex]);
        }
        break;
    }
  }

  // Scroll automático al elemento seleccionado
  scrollToSelected(): void {
    setTimeout(() => {
      const selected = document.querySelector('.search-result-item.selected');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 0);
  }

  // Navegar al resultado seleccionado
  navigateToResult(result: SearchResult): void {
    this.router.navigate([result.route]);
    this.clearSearch();
    this.showSearchResults = false;
    this.searchInput?.nativeElement.blur();
  }

  // Limpiar búsqueda
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredResults = [];
    this.showSearchResults = false;
    this.selectedResultIndex = 0;
  }

  setupUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/perfil']),
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.router.navigate(['/configuracion']),
      },
      {
        separator: true,
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  toggleTheme(): void {
    this.temaService.toggleTheme();
  }

  openNotifications(): void {
    this.router.navigate(['/notificaciones']);
  }

  logout(): void {
    this.authService.logout();
  }
}
