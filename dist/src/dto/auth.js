"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verifyEmailSchema = exports.emailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    fullName: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    deviceFingerprint: zod_1.z.string().optional(),
});
exports.emailSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Please enter a valid email address' }),
});
exports.verifyEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6, 'OTP must be 6 digits'),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
});
//# sourceMappingURL=auth.js.map