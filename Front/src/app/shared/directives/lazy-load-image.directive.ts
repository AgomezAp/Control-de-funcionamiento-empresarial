import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appLazyLoadImage]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  @Input() appLazyLoadImage!: string;
  @Input() defaultImage: string = '/assets/images/placeholder.png';

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const img = this.el.nativeElement as HTMLImageElement;
    
    // Establecer imagen por defecto
    img.src = this.defaultImage;

    // Observar cuando la imagen entra en el viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = this.appLazyLoadImage;
          observer.unobserve(img);
        }
      });
    });

    observer.observe(img);
  }
}
