"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarClienteValidator = exports.crearClienteValidator = void 0;
const express_validator_1 = require("express-validator");
exports.crearClienteValidator = [
    (0, express_validator_1.body)("nombre")
        .trim()
        .notEmpty()
        .withMessage("El nombre del cliente es requerido")
        .isLength({ min: 2 })
        .withMessage("El nombre debe tener al menos 2 caracteres"),
    (0, express_validator_1.body)("pais")
        .trim()
        .notEmpty()
        .withMessage("El país es requerido"),
    (0, express_validator_1.body)("pautador_id")
        .notEmpty()
        .withMessage("El pautador es requerido")
        .isInt()
        .withMessage("El pautador debe ser un número válido"),
    (0, express_validator_1.body)("disenador_id")
        .optional()
        .isInt()
        .withMessage("El diseñador debe ser un número válido"),
    (0, express_validator_1.body)("fecha_inicio")
        .notEmpty()
        .withMessage("La fecha de inicio es requerida")
        .isISO8601()
        .withMessage("La fecha debe estar en formato válido (YYYY-MM-DD)"),
];
exports.actualizarClienteValidator = [
    (0, express_validator_1.param)("id").isInt().withMessage("El ID debe ser un número válido"),
    (0, express_validator_1.body)("nombre")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("El nombre debe tener al menos 2 caracteres"),
    (0, express_validator_1.body)("pais").optional().trim().notEmpty().withMessage("El país no puede estar vacío"),
    (0, express_validator_1.body)("pautador_id")
        .optional()
        .isInt()
        .withMessage("El pautador debe ser un número válido"),
    (0, express_validator_1.body)("disenador_id")
        .optional()
        .isInt()
        .withMessage("El diseñador debe ser un número válido"),
    (0, express_validator_1.body)("status")
        .optional()
        .isBoolean()
        .withMessage("El status debe ser verdadero o falso"),
];
