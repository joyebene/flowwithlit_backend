"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodValidationException = exports.InternalServerException = exports.ValidationException = exports.ConflictException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    status;
    isOperational;
    code;
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Trusted errors we can handle
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Specific Exception Classes (as requested)
class BadRequestException extends AppError {
    constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
        super(message, 400, code);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends AppError {
    constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
        super(message, 401, code);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends AppError {
    constructor(message = 'Forbidden', code = 'FORBIDDEN') {
        super(message, 403, code);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends AppError {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
        super(message, 404, code);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends AppError {
    constructor(message = 'Resource already exists', code = 'CONFLICT') {
        super(message, 409, code);
    }
}
exports.ConflictException = ConflictException;
class ValidationException extends AppError {
    constructor(message = 'Validation failed', code = 'VALIDATION_ERROR') {
        super(message, 422, code);
    }
}
exports.ValidationException = ValidationException;
class InternalServerException extends AppError {
    constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
        super(message, 500, code);
    }
}
exports.InternalServerException = InternalServerException;
// Zod Validation Error Handler
class ZodValidationException extends AppError {
    errors;
    constructor(errors) {
        const message = 'Validation failed';
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}
exports.ZodValidationException = ZodValidationException;
//# sourceMappingURL=error.js.map