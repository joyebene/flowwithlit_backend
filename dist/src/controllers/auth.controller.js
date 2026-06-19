"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmail = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const auth_1 = require("@/dto/auth");
const auth_service_1 = require("@/services/auth.service");
const client_1 = require("@prisma/client");
const authService = new auth_service_1.AuthService();
const register = async (req, res, next) => {
    try {
        const validated = auth_1.registerSchema.parse(req.body);
        const result = await authService.register(validated);
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ status: true, message: "User registered successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const validated = auth_1.loginSchema.parse(req.body);
        const result = await authService.login(validated);
        // Access Token
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 mins
        });
        // Refresh Token
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({ status: true, message: "User logged in sucessfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                status: false,
                message: "Refresh token required",
            });
        }
        const result = await authService.refreshToken(refreshToken);
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });
        if (result.refreshToken) {
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
        return res.json({
            status: true,
            message: "Token refreshed",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await authService.logout(refreshToken);
        }
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.json({
            status: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = auth_1.emailSchema.parse(req.body);
        const result = await authService.requestOtp(email, client_1.OtpPurpose.FORGOT_PASSWORD);
        res.json({ status: true, message: result.message });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { email, code, password } = auth_1.resetPasswordSchema.parse(req.body);
        const result = await authService.verifyOtpAndResetPassword(email, code, password);
        res.json({ status: true, message: result.message });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = auth_1.verifyEmailSchema.parse(req.body);
        const result = await authService.verifyEmail(email, code);
        res.json({ status: true, message: result.message });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = auth_1.emailSchema.parse(req.body);
        const result = await authService.requestOtp(email, client_1.OtpPurpose.EMAIL_VERIFICATION);
        res.json({ status: true, message: result.message });
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
//# sourceMappingURL=auth.controller.js.map