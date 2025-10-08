import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { UnauthorizedError } from "../utils/error.util";
import { ApiResponse } from "../utils/response.util";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Token no proporcionado");
    }

    const decoded = verifyToken(token);
    req.usuario = decoded;

    next();
  } catch (error: any) {
    return ApiResponse.error(
      res,
      error.message || "Token inválido o expirado",
      401
    );
  }
};