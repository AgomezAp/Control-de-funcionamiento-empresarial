import { Pipe, PipeTransform } from '@angular/core';
import { ColorUtil } from '../../core/utils/color.util';

@Pipe({
  name: 'estadoColor',
  standalone: true
})
export class EstadoColorPipe implements PipeTransform {
  transform(estado: string): string {
    return ColorUtil.getColorByEstado(estado);
  }
}