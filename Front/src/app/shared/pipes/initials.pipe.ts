import { Pipe, PipeTransform } from '@angular/core';
import { FormatUtil } from '../../core/utils/format.util';

@Pipe({
  name: 'initials',
  standalone: true  
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return FormatUtil.getInitials(value);
  }
}
