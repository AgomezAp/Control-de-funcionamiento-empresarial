import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { CommonModule } from '@angular/common';
import { DragDropDirective } from '../../../directives/drag-drop.directive';
import { FileSizePipe } from '../../../pipes/file-size.pipe';

@Component({
  selector: 'app-file-upload',
standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    ButtonModule,
    ProgressBarModule,
    DragDropDirective,
    FileSizePipe
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  @Input() multiple: boolean = true;
  @Input() maxFileSize: number = 10485760; // 10 MB
  @Input() accept: string = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx';
  @Input() disabled: boolean = false;
  
  @Output() onUpload = new EventEmitter<File[]>();
  @Output() onRemove = new EventEmitter<File>();

  uploadedFiles: File[] = [];
  uploading: boolean = false;
  uploadProgress: number = 0;

  onSelect(event: any): void {
    const files: File[] = event.files || event.currentFiles;
    this.handleFiles(files);
  }

  onFilesDropped(fileList: FileList): void {
    const files = Array.from(fileList);
    this.handleFiles(files);
  }

  private handleFiles(files: File[]): void {
    // Validar tamaño
    const validFiles = files.filter(file => {
      if (file.size > this.maxFileSize) {
        console.error(`Archivo ${file.name} excede el tamaño máximo`);
        return false;
      }
      return true;
    });

    if (!this.multiple) {
      this.uploadedFiles = [validFiles[0]];
    } else {
      this.uploadedFiles.push(...validFiles);
    }

    this.simulateUpload(validFiles);
  }

  private simulateUpload(files: File[]): void {
    this.uploading = true;
    this.uploadProgress = 0;

    const interval = setInterval(() => {
      this.uploadProgress += 10;
      
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploading = false;
        this.uploadProgress = 0;
        this.onUpload.emit(files);
      }
    }, 100);
  }

  removeFile(file: File): void {
    this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
    this.onRemove.emit(file);
  }

  clear(): void {
    this.uploadedFiles = [];
    this.uploadProgress = 0;
  }
}
