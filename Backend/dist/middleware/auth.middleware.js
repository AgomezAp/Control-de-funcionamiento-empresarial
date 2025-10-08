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
exports.authMiddleware = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const error_util_1 = require("../utils/error.util");
const response_util_1 = require("../utils/response.util");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            throw new error_util_1.UnauthorizedError("Token no proporcionado");
        }
        const decoded = (0, jwt_util_1.verifyToken)(token);
        req.usuario = decoded;
        next();
    }
    catch (error) {
        return response_util_1.ApiResponse.error(res, error.message || "Token inválido o expirado", 401);
    }
});
exports.authMiddleware = authMiddleware;
