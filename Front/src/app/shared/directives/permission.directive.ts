import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PermissionUtil } from '../../core/utils/permission.util';

@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective implements OnInit {
  @Input() appHasPermission!: { module: string; action: string };

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.viewContainer.clear();
      return;
    }

    const hasPermission = PermissionUtil.hasPermission(
      currentUser.rol,
      this.appHasPermission.module,
      this.appHasPermission.action
    );

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
