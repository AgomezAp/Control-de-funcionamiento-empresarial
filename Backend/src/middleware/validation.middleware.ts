import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ApiResponse } from "../utils/response.util";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Ejecutar todas las validaciones
    for (let validation of validations) {
      const result = await validation.run(req);
    }

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: any[] = [];
    errors.array().map((err: any) =>
      extractedErrors.push({ [err.param]: err.msg })
    );

    return ApiResponse.error(
      res,
      "Errores de validación",
      422,
      extractedErrors
    );
  };
};