"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarUsuarioValidator = exports.loginValidator = exports.registroUsuarioValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registroUsuarioValidator = [
    (0, express_validator_1.body)("nombre_completo")
        .trim()
        .notEmpty()
        .withMessage("El nombre completo es requerido")
        .isLength({ min: 3 })
        .withMessage("El nombre debe tener al menos 3 caracteres"),
    (0, express_validator_1.body)("correo")
        .trim()
        .notEmpty()
        .withMessage("El correo es requerido")
        .isEmail()
        .withMessage("Debe ser un correo válido")
        .normalizeEmail(),
    (0, express_validator_1.body)("contrasena")
        .trim()
        .notEmpty()
        .withMessage("La contraseña es requerida")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
    (0, express_validator_1.body)("rol_id")
        .notEmpty()
        .withMessage("El rol es requerido")
        .isInt()
        .withMessage("El rol debe ser un número"),
    (0, express_validator_1.body)("area_id")
        .notEmpty()
        .withMessage("El área es requerida")
        .isInt()
        .withMessage("El área debe ser un número"),
];
exports.loginValidator = [
    (0, express_validator_1.body)("correo")
        .trim()
        .notEmpty()
        .withMessage("El correo es requerido")
        .isEmail()
        .withMessage("Debe ser un correo válido"),
    (0, express_validator_1.body)("contrasena")
        .trim()
        .notEmpty()
        .withMessage("La contraseña es requerida"),
];
exports.actualizarUsuarioValidator = [
    (0, express_validator_1.param)("uid").isInt().withMessage("El ID debe ser un número válido"),
    (0, express_validator_1.body)("nombre_completo")
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage("El nombre debe tener al menos 3 caracteres"),
    (0, express_validator_1.body)("correo")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Debe ser un correo válido"),
    (0, express_validator_1.body)("rol_id")
        .optional()
        .isInt()
        .withMessage("El rol debe ser un número"),
    (0, express_validator_1.body)("area_id")
        .optional()
        .isInt()
        .withMessage("El área debe ser un número"),
];
