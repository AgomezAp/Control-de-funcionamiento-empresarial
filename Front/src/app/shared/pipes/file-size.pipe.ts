import { Pipe, PipeTransform } from '@angular/core';
import { FormatUtil } from '../../core/utils/format.util';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (!value) return '0 Bytes';
    return FormatUtil.formatFileSize(value);
  }
}
