# 🚨 FIX: Error 404 en /api/peticiones/resumen/global

## ❌ Problema Identificado

### **Error Reportado:**
```
Backend retornó código 404, mensaje: Http failure response for 
http://localhost:3010/api/peticiones/resumen/global: 404 Not Found
```

### **Causa Raíz:**
En Express.js, **el orden de las rutas importa**. Las rutas con parámetros dinámicos como `/:id` deben estar **DESPUÉS** de las rutas específicas.

**Orden INCORRECTO (antes):**
```typescript
router.get("/", ...);                    // ✅ OK
router.get("/pendientes", ...);          // ✅ OK
router.get("/historico", ...);           // ✅ OK
router.get("/:id", ...);                 // ⚠️ PROBLEMA: está antes de /resumen/global
router.get("/resumen/global", ...);      // ❌ NUNCA SE ALCANZA
```

**¿Por qué falla?**
Cuando llamas a `/resumen/global`, Express intenta hacer match con las rutas en orden:
1. ❌ `/` → No hace match
2. ❌ `/pendientes` → No hace match
3. ❌ `/historico` → No hace match
4. ✅ `/:id` → **¡HACE MATCH!** Porque "resumen" se interpreta como el parámetro `id`
5. 🔴 `/resumen/global` → **NUNCA SE ALCANZA**

Entonces Express intenta ejecutar `obtenerPorId("resumen")` en lugar de `obtenerResumenGlobal()`.

---

## ✅ Solución Implementada

**Orden CORRECTO (ahora):**
```typescript
// ⚠️ IMPORTANTE: Rutas específicas ANTES de rutas con parámetros

router.get("/pendientes", ...);          // ✅ Específica
router.get("/historico", ...);           // ✅ Específica
router.get("/resumen/global", ...);      // ✅ Específica - AHORA ANTES de /:id
router.get("/cliente-mes", ...);         // ✅ Específica

router.get("/", ...);                    // ✅ General
router.get("/:id", ...);                 // ✅ Dinámica - AL FINAL
```

---

## 🔧 Archivo Modificado

**`Backend/src/routes/peticion.routes.ts`**

### **ANTES:**
```typescript
router.use(authMiddleware);

// Crear petición
router.post("/", ...);

// Obtener todas
router.get("/", ...);

// Pendientes
router.get("/pendientes", ...);

// Histórico
router.get("/historico", ...);

// Resumen global ❌ DESPUÉS DE /:id
router.get("/resumen/global", ...);

// Cliente mes
router.get("/cliente-mes", ...);

// Por ID ⚠️ ESTÁ CAPTURANDO /resumen/global
router.get("/:id", ...);
```

### **AHORA:**
```typescript
router.use(authMiddleware);

// ⚠️ IMPORTANTE: Rutas específicas ANTES de rutas con parámetros

// Pendientes
router.get("/pendientes", ...);

// Histórico
router.get("/historico", ...);

// Resumen global ✅ ANTES DE /:id
router.get("/resumen/global", 
  roleAuth("Admin", "Directivo", "Líder"),
  peticionController.obtenerResumenGlobal
);

// Cliente mes
router.get("/cliente-mes", ...);

// Crear petición
router.post("/", ...);

// Obtener todas
router.get("/", ...);

// Por ID ✅ AL FINAL
router.get("/:id", ...);

// Resto de rutas...
router.post("/:id/aceptar", ...);
router.patch("/:id/estado", ...);
router.put("/:id", ...);
```

---

## 🎯 Regla de Oro en Express

```
📌 SIEMPRE: Rutas específicas → ANTES → Rutas con parámetros
```

**Orden correcto:**
1. Rutas exactas: `/pendientes`, `/historico`, `/resumen/global`
2. Rutas generales: `/`
3. Rutas con parámetros: `/:id`, `/:id/aceptar`

---

## 🧪 Cómo Verificar que Funciona

### **1. Reiniciar el Backend:**
```bash
cd Backend
npm run dev
```

### **2. Verificar en consola del backend:**
Deberías ver:
```
✅ Conectado a la base de datos PostgreSQL con éxito
🔗 Asociaciones de modelos cargadas
✅ Modelos sincronizados con la base de datos
Servidor corriendo en puerto 3010
```

### **3. Probar endpoint manualmente:**
```bash
# Con curl
curl -H "Authorization: Bearer <tu_token>" \
  http://localhost:3010/api/peticiones/resumen/global

# O en navegador/Postman
GET http://localhost:3010/api/peticiones/resumen/global
Headers:
  Authorization: Bearer <tu_token>
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "total_peticiones": 25,
    "por_estado": {
      "pendientes": 5,
      "en_progreso": 8,
      "resueltas": 10,
      "canceladas": 2
    },
    "costo_total": 1500000,
    "activas": 13,
    "historicas": 12
  },
  "message": "Resumen global de peticiones obtenido exitosamente"
}
```

### **4. Verificar en el Frontend:**
- Recargar el Dashboard Admin
- Ya no debe aparecer error 404
- Los contadores deben mostrar valores correctos (no 0)

---

## 📊 Sobre las Estadísticas en 0

### **Problema Reportado:**
> "Las estadísticas me salen siempre en 0, no sé de dónde toma los datos"

### **Causa:**
El error 404 impedía que el dashboard cargara los datos. Una vez arreglada la ruta, los datos deberían aparecer correctamente.

### **Endpoints que se están llamando:**

#### **1. Resumen Global de Peticiones:**
```http
GET /api/peticiones/resumen/global
```
**Retorna:**
- `total_peticiones` (activas + históricas)
- `por_estado` (pendientes, en_progreso, resueltas, canceladas)
- `costo_total`

**Fuente de datos:**
```sql
-- Activas
SELECT * FROM peticiones WHERE estado IN ('Pendiente', 'En Progreso');

-- Históricas
SELECT * FROM peticiones_historico WHERE estado IN ('Resuelta', 'Cancelada');

-- Total = COUNT(activas) + COUNT(históricas)
```

#### **2. Estadísticas Globales del Mes:**
```http
GET /api/estadisticas/globales?año=2025&mes=10
```
**Retorna:**
- `totales.total_peticiones_creadas`
- `totales.total_peticiones_resueltas`
- `totales.total_costo_generado`
- `por_area` (desglose por área)
- `por_usuario` (desglose por usuario)

**Fuente de datos:**
```sql
-- Estadísticas precalculadas
SELECT * FROM estadisticas_usuario 
WHERE año = 2025 AND mes = 10;

-- Agregadas desde:
-- - peticiones (activas)
-- - peticiones_historico (completadas)
```

---

## 🔍 Si Aún Aparecen 0s

### **Verificar que existan datos:**

```sql
-- 1. Verificar peticiones activas
SELECT COUNT(*), estado FROM peticiones GROUP BY estado;

-- 2. Verificar peticiones históricas
SELECT COUNT(*), estado FROM peticiones_historico GROUP BY estado;

-- 3. Verificar estadísticas del mes actual
SELECT * FROM estadisticas_usuario 
WHERE año = 2025 AND mes = 10;
```

### **Si no hay datos en estadisticas_usuario:**

Esto significa que nadie ha calculado las estadísticas para octubre 2025. Puedes:

**Opción 1: Recalcular estadísticas (como Admin)**
```http
POST /api/estadisticas/recalcular
Body: { "año": 2025, "mes": 10 }
```

**Opción 2: Las estadísticas se calculan automáticamente cuando:**
- Se crea una petición
- Se resuelve una petición
- Se cancela una petición
- Al final de cada mes (cron job)

### **Si no hay peticiones en absoluto:**

Es normal que todo esté en 0 si:
- ✅ Es un sistema nuevo sin datos
- ✅ Estás en un mes donde no se han creado peticiones
- ✅ Todas las peticiones son de meses anteriores

**Solución:** Crear peticiones de prueba o cambiar el mes en el filtro del dashboard.

---

## 📝 Resumen de Cambios

**Archivos modificados:**
1. ✅ `Backend/src/routes/peticion.routes.ts` - Reordenadas las rutas

**Archivos sin cambios (ya estaban correctos):**
- ✅ `Backend/src/services/peticion.service.ts` - Método `obtenerResumenGlobal()` ✅
- ✅ `Backend/src/controllers/peticion.controller.ts` - Controller ✅
- ✅ `Front/src/app/core/services/peticion.service.ts` - Servicio ✅
- ✅ `Front/src/app/core/constants/api.constants.ts` - Constante ✅
- ✅ `Front/src/app/components/dashboard-admin/dashboard-admin/dashboard-admin.component.ts` - Lógica ✅

**Acción requerida:**
🔄 **Reiniciar el servidor backend** para que cargue las rutas en el nuevo orden.

---

## ✅ Checklist Final

- [x] Rutas reordenadas (específicas antes de dinámicas)
- [ ] Backend reiniciado
- [ ] Dashboard recargado sin error 404
- [ ] Contadores muestran valores correctos (no todos en 0)
- [ ] Gráficas se renderizan correctamente
- [ ] Estadísticas del mes aparecen

---

**✅ FIX COMPLETADO - Solo falta reiniciar el backend**
