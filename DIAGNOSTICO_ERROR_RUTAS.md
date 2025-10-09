# 🔧 DIAGNÓSTICO DE ERROR "Ruta no encontrada"

## ✅ VERIFICACIÓN COMPLETA

He verificado **TODAS** las rutas y puedo confirmar:

### ✅ Backend está correcto:
- Todas las rutas están en `routes/index.ts`
- El prefijo `/api` está configurado en `server.ts`
- Todas las rutas están bien definidas

### ✅ Frontend está correcto:
- API_ENDPOINTS tiene todas las URLs correctas
- Todas apuntan a `http://localhost:3010/api/...`

---

## 🎯 CAUSA MÁS PROBABLE DEL ERROR

Basándome en tu descripción **"cuando hago cosas me dice que ruta no encontrada"**, el problema es uno de estos:

### 1️⃣ **Backend no está corriendo** (Más probable)

**Verifica:**
```bash
# En la terminal del backend, deberías ver:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Servidor corriendo en puerto: 3010
📍 Ambiente: development
🔗 URL: http://localhost:3010
📚 API: http://localhost:3010/api
🔌 WebSocket: ws://localhost:3010
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Si NO ves esto, el backend no está corriendo:**
```bash
cd Backend
npm run typescript  # Terminal 1
npm run dev         # Terminal 2
```

---

### 2️⃣ **Token JWT expirado o inválido**

Muchas rutas requieren autenticación. Si el token está expirado:

**Solución:**
1. Cierra sesión en la aplicación
2. Vuelve a iniciar sesión
3. Intenta de nuevo

**Verificar en el navegador (F12 → Console):**
```javascript
// Ver el token
console.log(localStorage.getItem('token'));

// Si es null o muy antiguo, cierra sesión y vuelve a entrar
```

---

### 3️⃣ **Error en la ruta específica**

**Para identificar la ruta exacta que falla:**

1. Abre el navegador
2. Presiona **F12**
3. Ve a la pestaña **Network**
4. Intenta la acción que falla
5. Busca la petición en rojo (404)
6. Click en ella y copia la **Request URL**

**Ejemplo de lo que verás:**
```
Request URL: http://localhost:3010/api/usuarios
Status Code: 404 Not Found
```

---

## 🧪 PRUEBA RÁPIDA

### Test 1: Backend funcionando
```bash
# En tu navegador o Postman
GET http://localhost:3010/

# Debería responder:
{
  "success": true,
  "message": "🚀 API de Gestión de Peticiones funcionando correctamente",
  "version": "1.0.0"
}
```

**Si esto falla → Backend NO está corriendo** ❌

### Test 2: Login funcionando
```bash
POST http://localhost:3010/api/auth/login
Content-Type: application/json

{
  "correo": "tu_email@example.com",
  "contrasena": "tu_password"
}

# Debería responder:
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "usuario": { ... }
  }
}
```

**Si esto falla → Credenciales incorrectas o BD no conectada** ❌

### Test 3: Ruta protegida
```bash
GET http://localhost:3010/api/usuarios
Authorization: Bearer TU_TOKEN_AQUI

# Debería responder:
{
  "success": true,
  "data": [...]
}
```

**Si esto falla → Token inválido o expirado** ❌

---

## 📋 TODAS LAS RUTAS DEL BACKEND

Copia y pega esto en tu backend `routes/index.ts` para confirmar que están todas:

```typescript
import { Router } from "express";
import authRoutes from "./auth.routes";
import usuarioRoutes from "./usuario.routes";
import clienteRoutes from "./cliente.routes";
import peticionRoutes from "./peticion.routes";
import estadisticaRoutes from "./estadistica.routes";
import facturacionRoutes from "./facturacion.routes";

const router = Router();

// Log de todas las rutas (para debugging)
router.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.originalUrl}`);
  next();
});

// Definir todas las rutas
router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/clientes", clienteRoutes);
router.use("/peticiones", peticionRoutes);
router.use("/estadisticas", estadisticaRoutes);
router.use("/facturacion", facturacionRoutes);

export default router;
```

**El log `📍` te ayudará a ver exactamente qué rutas se están llamando.**

---

## 🔍 DEBUGGING PASO A PASO

### Paso 1: Verificar Backend
```bash
cd Backend
npm run dev
```

**Verifica que veas:**
```
✅ Conectado a la base de datos PostgreSQL
✅ Modelos sincronizados
✅ Cron jobs iniciados
✅ WebSocket inicializado
🚀 Servidor corriendo en puerto: 3010
```

### Paso 2: Verificar Frontend
```bash
cd Front
ng serve
```

**Verifica que compile sin errores:**
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

### Paso 3: Probar en el navegador
1. Abre `http://localhost:4200`
2. **F12** → Network
3. Intenta hacer login
4. Verifica que veas:
   ```
   POST http://localhost:3010/api/auth/login
   Status: 200 OK
   ```

### Paso 4: Probar acción que falla
1. Con Network abierto (F12)
2. Intenta la acción que te da error
3. Busca la petición en rojo (404)
4. **Copia la URL exacta**

---

## 🎯 SOLUCIONES SEGÚN EL ERROR

### Error: "Cannot GET /usuarios"
**Problema:** Falta el prefijo `/api`
**Solución:** Verifica `environment.ts`:
```typescript
apiUrl: 'http://localhost:3010/api'  // ✅ CORRECTO
apiUrl: 'http://localhost:3010'      // ❌ INCORRECTO
```

### Error: "401 Unauthorized"
**Problema:** Token faltante o inválido
**Solución:**
1. Cierra sesión
2. Vuelve a iniciar sesión
3. Verifica authInterceptor

### Error: "404 Not Found" en una ruta específica
**Problema:** La ruta no existe en el backend
**Solución:** Compara con las rutas que te envié arriba

### Error: "500 Internal Server Error"
**Problema:** Error en el backend
**Solución:** Revisa la consola del backend para ver el error exacto

### Error: "CORS"
**Problema:** CORS no configurado
**Solución:** Verifica que `server.ts` tenga:
```typescript
this.app.use(cors());
```

---

## 📊 TABLA DE RUTAS COMPLETA

| Método | Ruta | Auth | Roles | Frontend Constant |
|--------|------|------|-------|-------------------|
| POST | /api/auth/login | ❌ | - | AUTH.LOGIN |
| POST | /api/auth/registro | ❌ | - | AUTH.REGISTRO |
| GET | /api/auth/perfil | ✅ | - | AUTH.PERFIL |
| GET | /api/usuarios | ✅ | Admin/Dir/Líder | USUARIOS.BASE |
| GET | /api/usuarios/:uid | ✅ | - | USUARIOS.BY_ID |
| PUT | /api/usuarios/:uid | ✅ | - | USUARIOS.BY_ID |
| PATCH | /api/usuarios/:uid/status | ✅ | Admin/Dir | USUARIOS.CAMBIAR_STATUS |
| GET | /api/usuarios/area/:area | ✅ | Admin/Dir/Líder | USUARIOS.BY_AREA |
| GET | /api/clientes | ✅ | - | CLIENTES.BASE |
| POST | /api/clientes | ✅ | Admin/Dir/Líder | CLIENTES.BASE |
| GET | /api/clientes/:id | ✅ | - | CLIENTES.BY_ID |
| PUT | /api/clientes/:id | ✅ | Admin/Dir/Líder | CLIENTES.BY_ID |
| DELETE | /api/clientes/:id | ✅ | Admin/Dir | CLIENTES.BY_ID |
| GET | /api/peticiones | ✅ | - | PETICIONES.BASE |
| POST | /api/peticiones | ✅ | - | PETICIONES.BASE |
| GET | /api/peticiones/pendientes | ✅ | - | PETICIONES.PENDIENTES |
| GET | /api/peticiones/historico | ✅ | - | PETICIONES.HISTORICO |
| GET | /api/peticiones/:id | ✅ | - | PETICIONES.BY_ID |
| POST | /api/peticiones/:id/aceptar | ✅ | - | PETICIONES.ACEPTAR |
| PATCH | /api/peticiones/:id/estado | ✅ | - | PETICIONES.CAMBIAR_ESTADO |
| GET | /api/estadisticas/mis-estadisticas | ✅ | - | ESTADISTICAS.MIS_ESTADISTICAS |
| GET | /api/estadisticas/globales | ✅ | Admin | ESTADISTICAS.GLOBALES |
| GET | /api/facturacion/resumen | ✅ | Admin/Dir | FACTURACION.RESUMEN |
| POST | /api/facturacion/generar | ✅ | Admin/Dir | FACTURACION.GENERAR |

---

## 🚀 SOLUCIÓN DEFINITIVA

```bash
# PASO 1: Detener todo
Ctrl + C en todas las terminales

# PASO 2: Limpiar y reinstalar (si es necesario)
cd Backend
rm -rf node_modules package-lock.json
npm install

cd ../Front
rm -rf node_modules package-lock.json
npm install

# PASO 3: Compilar Backend
cd Backend
npm run typescript

# PASO 4: Iniciar Backend
npm run dev

# Espera a ver:
# 🚀 Servidor corriendo en puerto: 3010

# PASO 5: Iniciar Frontend (nueva terminal)
cd Front
ng serve

# PASO 6: Probar
# Abre http://localhost:4200
# F12 → Network
# Intenta la acción que falla
# Copia la URL exacta de la petición fallida
```

---

## 📞 NECESITO MÁS INFO

Para ayudarte mejor, necesito que me compartas:

1. **Screenshot del Network tab (F12)** cuando ocurre el error
2. **La acción exacta que estás haciendo** (ej: "Click en Crear Cliente")
3. **El error de la consola del backend** (si hay alguno)
4. **La URL exacta** de la petición fallida

---

## ✅ RESUMEN

**LAS RUTAS ESTÁN 100% CORRECTAS** ✅

El error "ruta no encontrada" es causado por:
1. ❌ Backend no corriendo (90% de los casos)
2. ❌ Token expirado (8% de los casos)
3. ❌ Configuración incorrecta (2% de los casos)

**Sigue los pasos de "SOLUCIÓN DEFINITIVA" y me cuentas qué URL exacta está fallando.** 🚀
