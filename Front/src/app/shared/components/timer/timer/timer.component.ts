import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DateUtil } from '../../../../core/utils/date.util';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer',
 standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer-container" [class.warning]="isWarning" [class.expired]="isExpired">
      <div class="timer-icon">
        <i [class]="getIcon()"></i>
      </div>
      <div class="timer-content">
        <p class="timer-label">{{ getLabel() }}</p>
        <h3 class="timer-countdown">{{ countdown }}</h3>
        <div class="timer-progress">
          <div class="progress-bar" [style.width.%]="progressPercentage"></div>
        </div>
        <p class="timer-date">{{ fechaLimiteFormateada }}</p>
      </div>
    </div>
  `,
  styleUrl: './timer.component.css'
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() fechaLimite!: Date | string;
  @Input() tiempoLimiteHoras?: number;
  @Output() onVencido = new EventEmitter<void>();
  @Output() onProximoAVencer = new EventEmitter<void>();

  countdown: string = '00:00:00';
  fechaLimiteFormateada: string = '';
  isWarning: boolean = false;
  isExpired: boolean = false;
  progressPercentage: number = 0;

  private timerSubscription?: Subscription;
  private warningEmitted: boolean = false;

  ngOnInit(): void {
    this.updateTimer();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateTimer();
    });
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  private updateTimer(): void {
    const now = new Date();
    const target = new Date(this.fechaLimite);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdown = '00:00:00';
      this.isExpired = true;
      this.progressPercentage = 100;
      this.onVencido.emit();
      return;
    }

    // Calcular tiempo restante
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Calcular porcentaje de progreso
    if (this.tiempoLimiteHoras) {
      const totalMs = this.tiempoLimiteHoras * 60 * 60 * 1000;
      this.progressPercentage = ((totalMs - diff) / totalMs) * 100;
    }

    // Verificar si está próximo a vencer (menos de 2 horas)
    const hoursRemaining = diff / (1000 * 60 * 60);
    if (hoursRemaining < 2 && hoursRemaining > 0) {
      this.isWarning = true;
      if (!this.warningEmitted) {
        this.warningEmitted = true;
        this.onProximoAVencer.emit();
      }
    }

    this.fechaLimiteFormateada = DateUtil.formatDate(target, 'dd/MM/yyyy HH:mm');
  }

  getLabel(): string {
    if (this.isExpired) return 'VENCIDA';
    if (this.isWarning) return 'TIEMPO RESTANTE ⚠️';
    return 'TIEMPO RESTANTE';
  }

  getIcon(): string {
    if (this.isExpired) return 'pi pi-times-circle';
    if (this.isWarning) return 'pi pi-exclamation-triangle';
    return 'pi pi-clock';
  }
}