import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
 template: `
    <div class="empty-state">
      <i [class]="icon" class="empty-icon"></i>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <button 
        *ngIf="actionLabel"
        pButton 
        [label]="actionLabel"
        [icon]="actionIcon"
        (click)="onAction()"
        class="p-button-outlined"
      ></button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2xl);
      text-align: center;
      min-height: 300px;
    }

    .empty-icon {
      font-size: 4rem;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-lg);
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .empty-message {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-lg);
      max-width: 400px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'pi pi-inbox';
  @Input() title: string = 'No hay datos';
  @Input() message: string = 'No se encontraron resultados';
  @Input() actionLabel?: string;
  @Input() actionIcon: string = 'pi pi-plus';
  @Input() action?: () => void;

  onAction(): void {
    if (this.action) {
      this.action();
    }
  }
}
