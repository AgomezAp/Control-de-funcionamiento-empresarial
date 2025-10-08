import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { MENSAJES } from '../constants/mensajes.constants';
import { ConfirmationService } from 'primeng/api';
export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = (
  component: ComponentCanDeactivate
) => {
  const confirmationService = inject(ConfirmationService);

  // Si el componente tiene cambios sin guardar
  if (component.canDeactivate && !component.canDeactivate()) {
    return new Promise<boolean>((resolve) => {
      confirmationService.confirm({
        message: MENSAJES.WARNING.CAMBIOS_SIN_GUARDAR,
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, salir',
        rejectLabel: 'Cancelar',
        accept: () => resolve(true),
        reject: () => resolve(false)
      });9
    });
  }

  return true;
};
