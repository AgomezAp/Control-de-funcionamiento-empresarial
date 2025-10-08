import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, CardModule],
 template: `
    <p-card 
      [header]="header"
      [subheader]="subheader"
      [styleClass]="styleClass"
    >
      <ng-content></ng-content>
      
      <ng-container *ngIf="footer">
        <ng-template pTemplate="footer">
          <ng-content select="[footer]"></ng-content>
        </ng-template>
      </ng-container>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CardComponent {
  @Input() header?: string;
  @Input() subheader?: string;
  @Input() styleClass?: string;
  @Input() footer: boolean = false;
}
