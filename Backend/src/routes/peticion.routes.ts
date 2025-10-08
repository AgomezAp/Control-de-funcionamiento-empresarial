import { Router } from "express";
import { PeticionController } from "../controllers/peticion.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleAuth } from "../middleware/roleAuth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  crearPeticionValidator,
  actualizarPeticionValidator,
  cambiarEstadoPeticionValidator,
  aceptarPeticionValidator,
  obtenerPeticionesPorClienteMesValidator,
} from "../validators/peticion.validator";

const router = Router();
const peticionController = new PeticionController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear petición
router.post(
  "/",
  validate(crearPeticionValidator),
  peticionController.crear
);

// Obtener todas las peticiones (con filtros opcionales)
router.get("/", peticionController.obtenerTodos);

// Obtener peticiones pendientes
router.get("/pendientes", peticionController.obtenerPendientes);

// Obtener histórico de peticiones
router.get("/historico", peticionController.obtenerHistorico);

// Obtener peticiones por cliente y mes
router.get(
  "/cliente-mes",
  validate(obtenerPeticionesPorClienteMesValidator),
  peticionController.obtenerPorClienteYMes
);

// Obtener petición por ID
router.get("/:id", peticionController.obtenerPorId);

// Aceptar petición (Diseñadores y Pautas)
router.post(
  "/:id/aceptar",
  validate(aceptarPeticionValidator),
  peticionController.aceptarPeticion
);

// Cambiar estado de petición
router.patch(
  "/:id/estado",
  validate(cambiarEstadoPeticionValidator),
  peticionController.cambiarEstado
);

// Actualizar petición
router.put(
  "/:id",
  validate(actualizarPeticionValidator),
  peticionController.actualizar
);

export default router;