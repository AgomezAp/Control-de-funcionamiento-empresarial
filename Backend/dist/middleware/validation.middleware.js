"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const response_util_1 = require("../utils/response.util");
const validate = (validations) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // Ejecutar todas las validaciones
        for (let validation of validations) {
            const result = yield validation.run(req);
        }
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const extractedErrors = [];
        errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
        return response_util_1.ApiResponse.error(res, "Errores de validación", 422, extractedErrors);
    });
};
exports.validate = validate;
