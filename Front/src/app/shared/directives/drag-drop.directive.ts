import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appDragDrop]',
  standalone: true
})
export class DragDropDirective {
  @Output() filesDropped = new EventEmitter<FileList>();
  @HostBinding('class.file-over') fileOver = false;

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.filesDropped.emit(files);
    }
  }
}
