import { body, param } from "express-validator";

export const crearClienteValidator = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del cliente es requerido")
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres"),

  body("pais")
    .trim()
    .notEmpty()
    .withMessage("El país es requerido"),

  body("tipo_cliente")
    .notEmpty()
    .withMessage("El tipo de cliente es requerido")
    .isIn(["Meta Ads", "Google Ads", "Externo", "Otro"])
    .withMessage("El tipo de cliente debe ser: Meta Ads, Google Ads, Externo u Otro"),

  body("pautador_id")
    .notEmpty()
    .withMessage("El pautador es requerido")
    .isInt()
    .withMessage("El pautador debe ser un número válido"),

  body("disenador_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt()
    .withMessage("El diseñador debe ser un número válido"),

  body("fecha_inicio")
    .notEmpty()
    .withMessage("La fecha de inicio es requerida")
    .isISO8601()
    .withMessage("La fecha debe estar en formato válido (YYYY-MM-DD)"),
];

export const actualizarClienteValidator = [
  param("id").isInt().withMessage("El ID debe ser un número válido"),

  body("nombre")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres"),

  body("pais").optional().trim().notEmpty().withMessage("El país no puede estar vacío"),

  body("tipo_cliente")
    .optional()
    .isIn(["Meta Ads", "Google Ads", "Externo", "Otro"])
    .withMessage("El tipo de cliente debe ser: Meta Ads, Google Ads, Externo u Otro"),

  body("pautador_id")
    .optional()
    .isInt()
    .withMessage("El pautador debe ser un número válido"),

  body("disenador_id")
    .optional({ nullable: true, checkFalsy: true })
    .isInt()
    .withMessage("El diseñador debe ser un número válido"),

  body("status")
    .optional()
    .isBoolean()
    .withMessage("El status debe ser verdadero o falso"),
];