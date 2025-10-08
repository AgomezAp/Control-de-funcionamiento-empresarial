export class ValidationUtil {
  // Validar email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar contraseña (mínimo 6 caracteres)
  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  // Validar contraseña fuerte (mayúscula, minúscula, número, 8+ caracteres)
  static isStrongPassword(password: string): boolean {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  }

  // Validar URL
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validar número de teléfono colombiano
  static isValidColombianPhone(phone: string): boolean {
    const phoneRegex = /^3\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  // Validar solo números
  static isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }

  // Validar solo letras
  static isAlpha(value: string): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
  }

  // Validar alfanumérico
  static isAlphanumeric(value: string): boolean {
    return /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
  }

  // Validar rango de número
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  // Validar longitud de string
  static hasValidLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  // Validar archivo por extensión
  static isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  // Validar tamaño de archivo (en bytes)
  static isValidFileSize(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize;
  }
}