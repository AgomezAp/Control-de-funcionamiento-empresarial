import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleAuth } from "../middleware/roleAuth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  crearClienteValidator,
  actualizarClienteValidator,
} from "../validators/cliente.validator";

const router = Router();
const clienteController = new ClienteController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear cliente (Admin, Directivo, Líder)
router.post(
  "/",
  roleAuth("Admin", "Directivo", "Líder"),
  validate(crearClienteValidator),
  clienteController.crear
);

// Obtener todos los clientes
router.get("/", clienteController.obtenerTodos);

// Obtener cliente por ID
router.get("/:id", clienteController.obtenerPorId);

// Actualizar cliente (Admin, Directivo, Líder)
router.put(
  "/:id",
  roleAuth("Admin", "Directivo", "Líder"),
  validate(actualizarClienteValidator),
  clienteController.actualizar
);

// Desactivar cliente (Solo Admin y Directivo)
router.delete(
  "/:id",
  roleAuth("Admin", "Directivo"),
  clienteController.desactivar
);

export default router;