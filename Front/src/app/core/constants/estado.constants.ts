import { EstadoPeticion } from '../models/peticion.model';

export const ESTADOS_PETICION = {
  [EstadoPeticion.PENDIENTE]: {
    label: 'Pendiente',
    color: '#2196F3',
    icon: 'pi pi-clock',
    bgColor: 'rgba(33, 150, 243, 0.1)',
  },
  [EstadoPeticion.EN_PROGRESO]: {
    label: 'En Progreso',
    color: '#4CAF50',
      icon: 'pi pi-spin pi-spinner',
    bgColor: 'rgba(76, 175, 80, 0.1)',
  },
  [EstadoPeticion.RESUELTA]: {
    label: 'Resuelta',
    color: '#8BC34A',
    icon: 'pi pi-check-circle',
    bgColor: 'rgba(139, 195, 74, 0.1)',
  },
  [EstadoPeticion.CANCELADA]: {
    label: 'Cancelada',
    color: '#F44336',
    icon: 'pi pi-times-circle',
    bgColor: 'rgba(244, 67, 54, 0.1)',
  },
};

export const ESTADO_VENCIDA = {
  label: 'Vencida',
  color: '#D32F2F',
  icon: 'pi pi-exclamation-triangle',
  bgColor: 'rgba(211, 47, 47, 0.1)',
};

export const TRANSICIONES_ESTADO = {
  [EstadoPeticion.PENDIENTE]: [EstadoPeticion.EN_PROGRESO, EstadoPeticion.CANCELADA],
  [EstadoPeticion.EN_PROGRESO]: [EstadoPeticion.RESUELTA, EstadoPeticion.CANCELADA],
  [EstadoPeticion.RESUELTA]: [],
  [EstadoPeticion.CANCELADA]: [],
};