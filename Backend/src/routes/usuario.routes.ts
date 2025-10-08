import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleAuth } from "../middleware/roleAuth.middleware";
import { validate } from "../middleware/validation.middleware";
import { actualizarUsuarioValidator } from "../validators/usuario.validator";

const router = Router();
const usuarioController = new UsuarioController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los usuarios (Admin, Directivo, Líder)
router.get(
  "/",
  roleAuth("Admin", "Directivo", "Líder"),
  usuarioController.obtenerTodos
);

// Obtener usuarios por área
router.get(
  "/area/:area",
  roleAuth("Admin", "Directivo", "Líder"),
  usuarioController.obtenerPorArea
);

// Obtener usuario por ID
router.get("/:uid", usuarioController.obtenerPorId);

// Actualizar usuario
router.put(
  "/:uid",
  validate(actualizarUsuarioValidator),
  usuarioController.actualizar
);

// Cambiar status (Solo Admin y Directivo)
router.patch(
  "/:uid/status",
  roleAuth("Admin", "Directivo"),
  usuarioController.cambiarStatus
);

export default router;