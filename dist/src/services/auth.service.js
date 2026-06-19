"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const error_1 = require("@/utils/error");
const jwt_1 = require("@/utils/jwt");
const helper_1 = require("@/utils/helper");
const redis_1 = __importDefault(require("@/config/redis"));
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("./providers/email.service");
const prisma = new client_1.PrismaClient();
class AuthService {
    async register(data) {
        const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
        if (existing)
            throw new error_1.ConflictException('User already exists');
        const passwordHash = await bcrypt_1.default.hash(data.password, 12);
        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                passwordHash,
                fullName: data.fullName
            },
        });
        // Create default NGN account
        await prisma.account.create({
            data: {
                userId: user.id,
                type: 'FIAT',
                currency: 'NGN',
            },
        });
        // Request an OTP for email verification upon registration
        await this.requestOtp(user.email, client_1.OtpPurpose.EMAIL_VERIFICATION);
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        //hash refreshToken
        const tokenHash = crypto_1.default
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");
        // Store in Redis
        await redis_1.default.set(`refresh:${refreshToken}`, user.id, { EX: 7 * 24 * 60 * 60 });
        // Optional: Store in DB too for extra persistence
        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async login(data) {
        const user = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() }
        });
        if (!user || !(await bcrypt_1.default.compare(data.password, user.passwordHash))) {
            throw new error_1.UnauthorizedException('Invalid credentials');
        }
        // Rate limiting
        const attemptsKey = `login:attempts:${user.id}`;
        const attempts = await redis_1.default.incr(attemptsKey);
        if (attempts > 5)
            throw new error_1.BadRequestException('Too many login attempts. Try again later.');
        await redis_1.default.expire(attemptsKey, 300); // 5 minutes
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id, data.deviceFingerprint);
        const tokenHash = crypto_1.default
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");
        await redis_1.default.set(`refresh:${refreshToken}`, user.id, { EX: 7 * 24 * 60 * 60 });
        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken) {
        // Hash incoming refresh token
        const tokenHash = crypto_1.default.createHash('sha256')
            .update(refreshToken)
            .digest('hex');
        // Find token in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: {
                tokenHash,
            },
        });
        if (!storedToken) {
            throw new error_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (storedToken.expiresAt < new Date()) {
            throw new error_1.UnauthorizedException('Refresh token expired');
        }
        // Remove old token from Redis
        await redis_1.default.del(`refresh:${refreshToken}`);
        // Delete old token from database
        await prisma.refreshToken.delete({
            where: {
                tokenHash,
            },
        });
        // Generate new tokens
        const accessToken = (0, jwt_1.generateAccessToken)(storedToken.userId);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(storedToken.userId);
        // Hash new refresh token
        const newTokenHash = crypto_1.default.createHash('sha256')
            .update(newRefreshToken)
            .digest('hex');
        // Store in Redis
        await redis_1.default.set(`refresh:${newRefreshToken}`, storedToken.userId, {
            EX: 7 * 24 * 60 * 60,
        });
        // Store hash in DB
        await prisma.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                userId: storedToken.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async requestOtp(email, purpose) {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user)
            throw new error_1.BadRequestException('Err.');
        const code = (0, helper_1.generateOtp)(6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Create or update an existing OTP for this purpose
        await prisma.otp.upsert({
            where: { userId_purpose: { userId: user.id, purpose } },
            update: { code, expiresAt },
            create: { userId: user.id, code, expiresAt, purpose },
        });
        const emailHtml = `<p>Your OTP is: <strong>${code}</strong></p>`;
        await (0, email_service_1.sendEmail)({
            to: email,
            subject: 'Your One-Time Password',
            html: emailHtml,
        });
        return { message: `An OTP has been sent to ${email}. It will expire in 10 minutes.` };
    }
    async verifyEmail(email, code) {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user)
            throw new error_1.BadRequestException('Invalid request.');
        const otp = await prisma.otp.findUnique({
            where: { userId_purpose: { userId: user.id, purpose: client_1.OtpPurpose.EMAIL_VERIFICATION } },
        });
        if (!otp || otp.code !== code) {
            throw new error_1.BadRequestException('Invalid or incorrect OTP.');
        }
        if (otp.expiresAt < new Date()) {
            throw new error_1.BadRequestException('OTP has expired. Please request a new one.');
        }
        // Use a transaction to update user and delete OTP
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { isEmailVerified: true },
            }),
            prisma.otp.delete({
                where: { id: otp.id },
            }),
        ]);
        return { message: 'Email verified successfully.' };
    }
    async verifyOtpAndResetPassword(email, code, newPassword) {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user)
            throw new error_1.BadRequestException('Invalid request.');
        const otp = await prisma.otp.findUnique({
            where: { userId_purpose: { userId: user.id, purpose: client_1.OtpPurpose.FORGOT_PASSWORD } },
        });
        if (!otp || otp.code !== code) {
            throw new error_1.BadRequestException('Invalid or incorrect OTP.');
        }
        if (otp.expiresAt < new Date()) {
            throw new error_1.BadRequestException('OTP has expired. Please request a new one.');
        }
        // Hash the new password
        const passwordHash = await bcrypt_1.default.hash(newPassword, 12);
        // Use a transaction to update password and delete OTP atomically
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { passwordHash },
            }),
            prisma.otp.delete({
                where: { id: otp.id },
            }),
        ]);
        return { message: 'Password has been reset successfully.' };
    }
    async logout(refreshToken) {
        const tokenHash = crypto_1.default.createHash('sha256')
            .update(refreshToken)
            .digest('hex');
        await Promise.all([
            redis_1.default.del(`refresh:${refreshToken}`),
            prisma.refreshToken.deleteMany({
                where: {
                    tokenHash,
                },
            }),
        ]);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map