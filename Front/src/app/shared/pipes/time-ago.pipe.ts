import { Pipe, PipeTransform } from '@angular/core';
import { DateUtil } from '../../core/utils/date.util';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | null | undefined): string {
    if (!value) return '';
    return DateUtil.timeAgo(value);
  }
}
