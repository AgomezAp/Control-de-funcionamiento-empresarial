"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPeticionesPorClienteMesValidator = exports.aceptarPeticionValidator = exports.cambiarEstadoPeticionValidator = exports.actualizarPeticionValidator = exports.crearPeticionValidator = void 0;
const express_validator_1 = require("express-validator");
exports.crearPeticionValidator = [
    (0, express_validator_1.body)("cliente_id")
        .notEmpty()
        .withMessage("El cliente es requerido")
        .isInt()
        .withMessage("El cliente debe ser un número válido"),
    (0, express_validator_1.body)("categoria_id")
        .notEmpty()
        .withMessage("La categoría es requerida")
        .isInt()
        .withMessage("La categoría debe ser un número válido"),
    (0, express_validator_1.body)("area")
        .notEmpty()
        .withMessage("El área es requerida")
        .isIn(["Pautas", "Diseño", "Gestión Administrativa"])
        .withMessage("El área debe ser 'Pautas', 'Diseño' o 'Gestión Administrativa'"),
    (0, express_validator_1.body)("descripcion")
        .trim()
        .notEmpty()
        .withMessage("La descripción es requerida")
        .isLength({ min: 10 })
        .withMessage("La descripción debe tener al menos 10 caracteres"),
    (0, express_validator_1.body)("descripcion_extra")
        .optional()
        .trim(),
    (0, express_validator_1.body)("costo")
        .optional()
        .isDecimal()
        .withMessage("El costo debe ser un número válido"),
    (0, express_validator_1.body)("tiempo_limite_horas")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El tiempo límite debe ser un número entero positivo"),
];
exports.actualizarPeticionValidator = [
    (0, express_validator_1.param)("id").isInt().withMessage("El ID debe ser un número válido"),
    (0, express_validator_1.body)("descripcion")
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage("La descripción debe tener al menos 10 caracteres"),
    (0, express_validator_1.body)("costo")
        .optional()
        .isDecimal()
        .withMessage("El costo debe ser un número válido"),
    (0, express_validator_1.body)("tiempo_limite_horas")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El tiempo límite debe ser un número entero positivo"),
];
exports.cambiarEstadoPeticionValidator = [
    (0, express_validator_1.param)("id").isInt().withMessage("El ID debe ser un número válido"),
    (0, express_validator_1.body)("estado")
        .notEmpty()
        .withMessage("El estado es requerido")
        .isIn(["Pendiente", "En Progreso", "Pausada", "Resuelta", "Cancelada"])
        .withMessage("El estado debe ser: Pendiente, En Progreso, Pausada, Resuelta o Cancelada"),
];
exports.aceptarPeticionValidator = [
    (0, express_validator_1.param)("id").isInt().withMessage("El ID debe ser un número válido"),
];
exports.obtenerPeticionesPorClienteMesValidator = [
    (0, express_validator_1.query)("cliente_id")
        .notEmpty()
        .withMessage("El cliente_id es requerido")
        .isInt()
        .withMessage("El cliente_id debe ser un número válido"),
    (0, express_validator_1.query)("año")
        .notEmpty()
        .withMessage("El año es requerido")
        .isInt({ min: 2020, max: 2100 })
        .withMessage("El año debe ser un número válido"),
    (0, express_validator_1.query)("mes")
        .notEmpty()
        .withMessage("El mes es requerido")
        .isInt({ min: 1, max: 12 })
        .withMessage("El mes debe estar entre 1 y 12"),
];
