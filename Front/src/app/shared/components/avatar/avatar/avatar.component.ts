import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { InitialsPipe } from '../../../pipes/initials.pipe';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, AvatarModule, InitialsPipe],
  template: `
    <p-avatar 
      *ngIf="!imageUrl"
      [label]="name | initials"
      [size]="size"
      [shape]="shape"
      [style]="{ 
        'background-color': backgroundColor, 
        'color': textColor,
        'cursor': clickable ? 'pointer' : 'default'
      }"
      (click)="onClick()"
    ></p-avatar>

    <p-avatar 
      *ngIf="imageUrl"
      [image]="imageUrl"
      [size]="size"
      [shape]="shape"
      [style]="{ 'cursor': clickable ? 'pointer' : 'default' }"
      (click)="onClick()"
    ></p-avatar>
  `
})
export class AvatarComponent {
  @Input() name: string = '';
  @Input() imageUrl?: string;
  @Input() size: 'normal' | 'large' | 'xlarge' = 'normal';
  @Input() shape: 'square' | 'circle' = 'circle';
  @Input() backgroundColor: string = 'var(--color-accent)';
  @Input() textColor: string = '#000';
  @Input() clickable: boolean = false;
  @Input() action?: () => void;

  onClick(): void {
    if (this.clickable && this.action) {
      this.action();
    }
  }
}