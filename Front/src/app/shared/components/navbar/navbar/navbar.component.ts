import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenuModule,
    BadgeModule,
    AvatarModule,
    InitialsPipe,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  currentUser: UsuarioAuth | null = null;
  isDarkMode$: Observable<boolean>;
  unreadCount$: Observable<number>;
  userMenuItems: MenuItem[] = [];

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
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setupUserMenu();
    });
  }

  setupUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/perfil'])
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.router.navigate(['/configuracion'])
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
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
