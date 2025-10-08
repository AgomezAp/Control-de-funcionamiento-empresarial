import { body, param } from "express-validator";

export const registroUsuarioValidator = [
  body("nombre_completo")
    .trim()
    .notEmpty()
    .withMessage("El nombre completo es requerido")
    .isLength({ min: 3 })
    .withMessage("El nombre debe tener al menos 3 caracteres"),

  body("correo")
    .trim()
    .notEmpty()
    .withMessage("El correo es requerido")
    .isEmail()
    .withMessage("Debe ser un correo válido")
    .normalizeEmail(),

  body("contrasena")
    .trim()
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("rol_id")
    .notEmpty()
    .withMessage("El rol es requerido")
    .isInt()
    .withMessage("El rol debe ser un número"),

  body("area_id")
    .notEmpty()
    .withMessage("El área es requerida")
    .isInt()
    .withMessage("El área debe ser un número"),
];

export const loginValidator = [
  body("correo")
    .trim()
    .notEmpty()
    .withMessage("El correo es requerido")
    .isEmail()
    .withMessage("Debe ser un correo válido"),

  body("contrasena")
    .trim()
    .notEmpty()
    .withMessage("La contraseña es requerida"),
];

export const actualizarUsuarioValidator = [
  param("uid").isInt().withMessage("El ID debe ser un número válido"),

  body("nombre_completo")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("El nombre debe tener al menos 3 caracteres"),

  body("correo")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Debe ser un correo válido"),

  body("rol_id")
    .optional()
    .isInt()
    .withMessage("El rol debe ser un número"),

  body("area_id")
    .optional()
    .isInt()
    .withMessage("El área debe ser un número"),
];