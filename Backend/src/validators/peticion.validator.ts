import { body, param, query } from "express-validator";

export const crearPeticionValidator = [
  body("cliente_id")
    .notEmpty()
    .withMessage("El cliente es requerido")
    .isInt()
    .withMessage("El cliente debe ser un número válido"),

  body("categoria_id")
    .notEmpty()
    .withMessage("La categoría es requerida")
    .isInt()
    .withMessage("La categoría debe ser un número válido"),

  body("area")
    .notEmpty()
    .withMessage("El área es requerida")
    .isIn(["Pautas", "Diseño"])
    .withMessage("El área debe ser 'Pautas' o 'Diseño'"),

  body("descripcion")
    .trim()
    .notEmpty()
    .withMessage("La descripción es requerida")
    .isLength({ min: 10 })
    .withMessage("La descripción debe tener al menos 10 caracteres"),

  body("descripcion_extra")
    .optional()
    .trim(),

  body("costo")
    .optional()
    .isDecimal()
    .withMessage("El costo debe ser un número válido"),

  body("tiempo_limite_horas")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El tiempo límite debe ser un número entero positivo"),
];

export const actualizarPeticionValidator = [
  param("id").isInt().withMessage("El ID debe ser un número válido"),

  body("descripcion")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("La descripción debe tener al menos 10 caracteres"),

  body("costo")
    .optional()
    .isDecimal()
    .withMessage("El costo debe ser un número válido"),

  body("tiempo_limite_horas")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El tiempo límite debe ser un número entero positivo"),
];

export const cambiarEstadoPeticionValidator = [
  param("id").isInt().withMessage("El ID debe ser un número válido"),

  body("estado")
    .notEmpty()
    .withMessage("El estado es requerido")
    .isIn(["Pendiente", "En Progreso", "Resuelta", "Cancelada"])
    .withMessage("El estado debe ser: Pendiente, En Progreso, Resuelta o Cancelada"),
];

export const aceptarPeticionValidator = [
  param("id").isInt().withMessage("El ID debe ser un número válido"),
];

export const obtenerPeticionesPorClienteMesValidator = [
  query("cliente_id")
    .notEmpty()
    .withMessage("El cliente_id es requerido")
    .isInt()
    .withMessage("El cliente_id debe ser un número válido"),

  query("año")
    .notEmpty()
    .withMessage("El año es requerido")
    .isInt({ min: 2020, max: 2100 })
    .withMessage("El año debe ser un número válido"),

  query("mes")
    .notEmpty()
    .withMessage("El mes es requerido")
    .isInt({ min: 1, max: 12 })
    .withMessage("El mes debe estar entre 1 y 12"),
];