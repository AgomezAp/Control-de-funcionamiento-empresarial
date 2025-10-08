import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <i class="pi pi-exclamation-triangle not-found-icon"></i>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>La página que buscas no existe o ha sido movida.</p>
        <button
          pButton
          label="Volver al inicio"
          icon="pi pi-home"
          routerLink="/dashboard"
        ></button>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
        padding: var(--spacing-lg);
      }

      .not-found-content {
        text-align: center;
        color: white;
      }

      .not-found-icon {
        font-size: 5rem;
        color: var(--color-accent);
        margin-bottom: var(--spacing-lg);
      }

      h1 {
        font-size: 6rem;
        font-weight: 700;
        margin: 0;
        color: var(--color-accent);
      }

      h2 {
        font-size: 2rem;
        margin: var(--spacing-md) 0;
      }

      p {
        font-size: 1.125rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: var(--spacing-2xl);
      }
    `,
  ],
})
export class NotFoundComponent {}
