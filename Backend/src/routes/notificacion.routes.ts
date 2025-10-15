import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import notificacionService from "../services/notificacion.service";

const router = Router();

/**
 * Obtener todas las notificaciones del usuario actual
 */
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const { leida, limit } = req.query;
    
    const filtros: any = {};
    if (leida !== undefined) {
      filtros.leida = leida === "true";
    }
    if (limit) {
      filtros.limit = parseInt(limit);
    }

    const notificaciones = await notificacionService.obtenerPorUsuario(
      req.usuario.uid,
      filtros
    );

    res.json(notificaciones);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Obtener contador de notificaciones no leídas
 */
router.get("/no-leidas/count", authMiddleware, async (req: any, res) => {
  try {
    const total = await notificacionService.contarNoLeidas(req.usuario.uid);
    res.json({ total });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Marcar notificación como leída
 */
router.patch("/:id/leida", authMiddleware, async (req: any, res) => {
  try {
    const notificacion = await notificacionService.marcarComoLeida(
      parseInt(req.params.id),
      req.usuario.uid
    );
    res.json(notificacion);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * Marcar todas las notificaciones como leídas
 */
router.patch("/todas/leidas", authMiddleware, async (req: any, res) => {
  try {
    const resultado = await notificacionService.marcarTodasComoLeidas(req.usuario.uid);
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Eliminar notificación
 */
router.delete("/:id", authMiddleware, async (req: any, res) => {
  try {
    const resultado = await notificacionService.eliminar(
      parseInt(req.params.id),
      req.usuario.uid
    );
    res.json(resultado);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * Eliminar todas las notificaciones
 */
router.delete("/", authMiddleware, async (req: any, res) => {
  try {
    const resultado = await notificacionService.eliminarTodas(req.usuario.uid);
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
