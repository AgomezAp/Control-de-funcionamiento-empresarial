import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, search: string): SafeHtml {
    if (!search || !value) {
      return value;
    }

    const regex = new RegExp(search, 'gi');
    const highlighted = value.replace(
      regex, 
      (match) => `<mark class="bg-yellow-300 text-black">${match}</mark>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
