import { Response } from "express";

export class ApiResponse {
  static success(res: Response, data: any, message = "Operación exitosa", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message = "Error en la operación", statusCode = 500, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static created(res: Response, data: any, message = "Recurso creado exitosamente") {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}