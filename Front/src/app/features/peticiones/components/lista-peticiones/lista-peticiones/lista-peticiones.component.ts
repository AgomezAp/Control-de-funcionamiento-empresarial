import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-lista-peticiones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Módulo de Peticiones</h1>
      <p>En desarrollo...</p>
    </div>
  `,
})
export class ListaPeticionesComponent {}
