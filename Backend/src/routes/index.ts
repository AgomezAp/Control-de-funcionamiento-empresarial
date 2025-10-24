import { Router } from "express";
import authRoutes from "./auth.routes";
import usuarioRoutes from "./usuario.routes";
import clienteRoutes from "./cliente.routes";
import peticionRoutes from "./peticion.routes";
import estadisticaRoutes from "./estadistica.routes";
import facturacionRoutes from "./facturacion.routes";
import notificacionRoutes from "./notificacion.routes";
import categoriaRoutes from "./categoria.routes";
import reportesClientesRoutes from "./reportes-clientes.routes";

const router = Router();

// Definir todas las rutas
router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/clientes", clienteRoutes);
router.use("/peticiones", peticionRoutes);
router.use("/estadisticas", estadisticaRoutes);
router.use("/facturacion", facturacionRoutes);
router.use("/notificaciones", notificacionRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/reportes-clientes", reportesClientesRoutes);

export default router;