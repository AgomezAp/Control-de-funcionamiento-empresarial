import { Pipe, PipeTransform } from '@angular/core';
import { FormatUtil } from '../../core/utils/format.util';

@Pipe({
  name: 'currencyCop',
  standalone: true
})
export class CurrencycopPipe implements PipeTransform {
  transform(value: number | null | undefined, currency: string = 'COP'): string {
    if (value === null || value === undefined) return '$0';
    return FormatUtil.formatCurrency(value, currency);
  }
}
