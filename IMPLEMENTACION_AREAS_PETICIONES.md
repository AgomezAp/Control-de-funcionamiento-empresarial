# Resumen de Cambios - Implementación de Áreas y Auto-asignación

## 📋 Problemas Solucionados

### 1. ✅ Error al aceptar peticiones
**Problema**: Al intentar aceptar una petición, mostraba error "El tiempo límite es requerido"
**Solución**: Eliminada la validación de `tiempo_limite_horas` en el validador `aceptarPeticionValidator`
**Archivos modificados**:
- `Backend/src/validators/peticion.validator.ts`

### 2. ✅ Pérdida de datos en base de datos
**Problema**: `sync({ force: true })` borraba toda la data en cada reinicio del servidor
**Solución**: Cambio a `sync({ alter: true })` para actualizar schema sin borrar datos
**Archivos modificados**:
- `Backend/src/models/server.ts`

### 3. ✅ Nueva funcionalidad: Campo "Área"
**Requisito**: Diferenciar peticiones entre "Pautas" y "Diseño"
**Implementación**:
- Campo `area` agregado al modelo Peticion (Backend y Frontend)
- Dropdown en formulario de creación para seleccionar área
- Valores permitidos: "Pautas" o "Diseño"

**Archivos modificados**:
- `Backend/src/models/Peticion.ts` - Modelo con nuevo campo
- `Backend/src/validators/peticion.validator.ts` - Validación del campo area
- `Backend/src/services/peticion.service.ts` - Lógica de creación actualizada
- `Backend/src/scripts/add-area-peticiones.sql` - Script de migración
- `Front/src/app/core/models/peticion.model.ts` - Modelo frontend
- `Front/src/app/features/peticiones/components/crear-peticion/crear-peticion.component.ts`
- `Front/src/app/features/peticiones/components/crear-peticion/crear-peticion.component.html`

### 4. ✅ Auto-asignación de Peticiones de Pautas
**Requisito**: Cuando una petición es de "Pautas", debe asignarse automáticamente al pautador del cliente
**Implementación**:
- Las peticiones de "Pautas" se crean directamente en estado "En Progreso"
- Se asignan automáticamente al `pautador_id` del cliente
- El temporizador inicia automáticamente
- No requieren ser "aceptadas" manualmente
- Las peticiones de "Diseño" siguen el flujo normal (Pendiente → aceptación manual)

**Lógica implementada en**: `Backend/src/services/peticion.service.ts` - método `crear()`

## 📊 Flujo de Peticiones Actualizado

### Peticiones de Diseño:
1. Usuario crea petición con área = "Diseño"
2. Estado inicial: "Pendiente"
3. Un diseñador debe aceptarla manualmente
4. Al aceptar → Estado: "En Progreso" + temporizador inicia
5. Diseñador completa → Estado: "Resuelta"

### Peticiones de Pautas:
1. Usuario crea petición con área = "Pautas"
2. **Auto-asignación automática** al pautador del cliente
3. Estado inicial: **"En Progreso"** (directo, sin aceptación)
4. Temporizador inicia automáticamente
5. Pautador completa → Estado: "Resuelta"

## 🗃️ Cambios en Base de Datos

### Nuevo campo en tabla `peticiones`:
```sql
area VARCHAR(10) NOT NULL CHECK (area IN ('Pautas', 'Diseño'))
```

### Script de migración:
```bash
# Ejecutar desde Backend:
psql -U usuario -d nombre_db -f src/scripts/add-area-peticiones.sql
```

O si prefieres que Sequelize lo haga automáticamente:
- El `sync({ alter: true })` agregará la columna automáticamente
- Pero los registros existentes quedarán con `area = NULL`
- Por eso es recomendable ejecutar el script SQL manualmente

## 🎨 Cambios en UI

### Formulario de Crear Petición:
- **Nuevo dropdown** "Área" en el paso de categoría
- Opciones: "Diseño" (default) o "Pautas"
- Mensaje informativo cuando se selecciona "Pautas":
  > "Las peticiones de Pautas se asignan automáticamente al pautador del cliente"

## 📝 Validaciones Agregadas

### Backend:
```typescript
body("area")
  .notEmpty()
  .withMessage("El área es requerida")
  .isIn(["Pautas", "Diseño"])
  .withMessage("El área debe ser 'Pautas' o 'Diseño'")
```

### Frontend:
```typescript
area: ['Diseño', Validators.required]
```

## 🔔 Notificaciones WebSocket

### Peticiones de Diseño:
- Emite evento: `nuevaPeticion`
- Todos los diseñadores reciben notificación

### Peticiones de Pautas:
- Emite evento: `peticionAceptada`
- Solo el pautador asignado recibe notificación
- Incluye información del temporizador iniciado

## ⚠️ Notas Importantes

1. **Datos del Cliente**: El problema de "no aparecen datos del cliente" probablemente se debe a que la base de datos fue borrada por `force: true`. Ahora con `alter: true` esto no volverá a pasar.

2. **Ejecutar Migración**: Si ya tienes peticiones en la base de datos, ejecuta el script `add-area-peticiones.sql` para agregar el campo `area` a los registros existentes.

3. **Testing**: Después de desplegar, prueba:
   - Crear petición de Diseño (debe quedar Pendiente)
   - Crear petición de Pautas (debe quedar En Progreso con pautador asignado)
   - Aceptar petición de Diseño (no debe pedir tiempo límite)

## 🚀 Próximos Pasos Sugeridos

1. Reiniciar el backend para que cargue los nuevos cambios
2. Ejecutar el script SQL si es necesario
3. Reiniciar datos iniciales si la DB está vacía: `npm run init-data`
4. Probar el flujo completo de creación de peticiones
5. Verificar que las peticiones de Pautas se asignan automáticamente

## 📂 Archivos Modificados

### Backend:
- `src/models/Peticion.ts`
- `src/models/server.ts`
- `src/validators/peticion.validator.ts`
- `src/services/peticion.service.ts`
- `src/scripts/add-area-peticiones.sql` (nuevo)

### Frontend:
- `src/app/core/models/peticion.model.ts`
- `src/app/features/peticiones/components/crear-peticion/crear-peticion.component.ts`
- `src/app/features/peticiones/components/crear-peticion/crear-peticion.component.html`
