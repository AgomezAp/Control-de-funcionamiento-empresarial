import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { RoleEnum } from '../../core/models/role.model';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole!: RoleEnum | RoleEnum[];

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

    const allowedRoles = Array.isArray(this.appHasRole) ? this.appHasRole : [this.appHasRole];
    const hasRole = allowedRoles.includes(currentUser.rol);

    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
