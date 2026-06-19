"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const error_1 = require("@/utils/error");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    // Prisma Errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            error = new error_1.ConflictException('Duplicate field value entered', 'DUPLICATE_ENTRY');
        }
    }
    // Zod Validation Error (if you're using Zod)
    if (err.name === 'ZodError') {
        error = new error_1.ZodValidationException(err.message);
    }
    // Operational (trusted) errors
    if (err instanceof error_1.AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            code: err.code,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }
    // Programming or unknown errors (don't leak details in production)
    console.error('ERROR 💥:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message,
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map