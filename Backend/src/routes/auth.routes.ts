import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { registroUsuarioValidator, loginValidator } from "../validators/usuario.validator";

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post("/registro", validate(registroUsuarioValidator), authController.registrar);
router.post("/login", validate(loginValidator), authController.login);

// Rutas protegidas
router.get("/perfil", authMiddleware, authController.perfil);

export default router;