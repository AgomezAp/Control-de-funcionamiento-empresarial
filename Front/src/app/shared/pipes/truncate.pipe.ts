import { Pipe, PipeTransform } from '@angular/core';
import { FormatUtil } from '../../core/utils/format.util';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, length: number = 50): string {
    if (!value) return '';
    return FormatUtil.truncate(value, length);
  }
}
