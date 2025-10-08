import { AreaEnum } from '../models/area.model';

export const AREAS = {
  [AreaEnum.GESTION_ADMINISTRATIVA]: {
    id: 1,
    nombre: 'Gestión Administrativa',
    color: '#FF9800',
    icon: 'pi pi-briefcase',
    descripcion: 'Administración y coordinación general',
  },
  [AreaEnum.PAUTAS]: {
    id: 2,
    nombre: 'Pautas',
    color: '#2196F3',
    icon: 'pi pi-chart-line',
    descripcion: 'Gestión de campañas y estrategias',
  },
  [AreaEnum.DISENO]: {
    id: 3,
    nombre: 'Diseño',
    color: '#9C27B0',
    icon: 'pi pi-palette',
    descripcion: 'Diseño gráfico y multimedia',
  },
  [AreaEnum.CONTABILIDAD]: {
    id: 4,
    nombre: 'Contabilidad',
    color: '#4CAF50',
    icon: 'pi pi-dollar',
    descripcion: 'Gestión financiera y contable',
  },
  [AreaEnum.PROGRAMACION]: {
    id: 5,
    nombre: 'Programación',
    color: '#607D8B',
    icon: 'pi pi-code',
    descripcion: 'Desarrollo y programación',
  },
};