import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="custom-badge" [class]="'badge-' + severity">
      <i *ngIf="icon" [class]="icon" class="badge-icon"></i>
      <span class="badge-text">{{ label }}</span>
    </span>
  `,
  styles: [`
    .custom-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: var(--border-radius-full);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition-fast);

      &.badge-pendiente {
        background-color: rgba(33, 150, 243, 0.1);
        color: var(--color-pendiente);
      }

      &.badge-en-progreso {
        background-color: rgba(76, 175, 80, 0.1);
        color: var(--color-en-progreso);
      }

      &.badge-resuelta {
        background-color: rgba(139, 195, 74, 0.1);
        color: var(--color-resuelta);
      }

      &.badge-cancelada {
        background-color: rgba(244, 67, 54, 0.1);
        color: var(--color-cancelada);
      }

      &.badge-vencida {
        background-color: rgba(211, 47, 47, 0.1);
        color: var(--color-vencida);
        animation: pulse 2s ease-in-out infinite;
      }

      &.badge-success {
        background-color: rgba(76, 175, 80, 0.1);
        color: var(--color-success);
      }

      &.badge-warning {
        background-color: rgba(255, 152, 0, 0.1);
        color: var(--color-warning);
      }

      &.badge-danger {
        background-color: rgba(244, 67, 54, 0.1);
        color: var(--color-danger);
      }

      &.badge-info {
        background-color: rgba(33, 150, 243, 0.1);
        color: var(--color-info);
      }
    }

    .badge-icon {
      font-size: 0.75rem;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `]
})
export class BadgeComponent {
  @Input() label: string = '';
  @Input() icon?: string;
  @Input() severity: string = 'info';
}