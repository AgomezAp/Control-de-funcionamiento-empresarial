import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RoleEnum } from '../../../core/models/role.model';
import { UsuarioAuth } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardAdminComponent } from '../../dashboard-admin/dashboard-admin/dashboard-admin.component';
import { DashboardUsuarioComponent } from '../../dashboard-usuario/dashboard-usuario/dashboard-usuario.component';
import { DashboardDirectivoComponent } from '../../dashboard-directivo/dashboard-directivo/dashboard-directivo.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    DashboardAdminComponent,
    DashboardDirectivoComponent,
    DashboardUsuarioComponent,
  ],
  template: `
    <div class="dashboard-container">
      <app-dashboard-admin *ngIf="isAdmin"></app-dashboard-admin>
      <app-dashboard-directivo
        *ngIf="isDirectivoOrLider"
      ></app-dashboard-directivo>
      <app-dashboard-usuario *ngIf="isUsuario"></app-dashboard-usuario>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: var(--spacing-lg);
      }
    `,
  ],
})
export class DashboardContainerComponent implements OnInit {
  currentUser: UsuarioAuth | null = null;
  isAdmin: boolean = false;
  isDirectivoOrLider: boolean = false;
  isUsuario: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.isAdmin = user.rol === RoleEnum.ADMIN;
        this.isDirectivoOrLider = [RoleEnum.DIRECTIVO, RoleEnum.LIDER].includes(user.rol);
        this.isUsuario = user.rol === RoleEnum.USUARIO;
      }
    });
  }
}
