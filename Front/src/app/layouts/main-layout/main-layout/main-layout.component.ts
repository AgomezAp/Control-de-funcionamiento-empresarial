import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar/sidebar.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar/navbar.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcumb/breadcumb/breadcumb.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    BreadcrumbComponent,
  ],
  template: `
    <div class="main-layout">
      <app-navbar></app-navbar>

      <div class="layout-content">
        <app-sidebar></app-sidebar>

        <main class="main-content">
          <app-breadcumb></app-breadcumb>
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .main-layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .layout-content {
        flex: 1;
        display: flex;
      }

      .main-content {
        flex: 1;
        padding: var(--spacing-lg);
        overflow-y: auto;
        background-color: var(--bg-primary);
      }
    `,
  ],
})
export class MainLayoutComponent {}
