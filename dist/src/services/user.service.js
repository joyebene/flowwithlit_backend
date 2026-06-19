"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const error_1 = require("@/utils/error");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("node_modules/bcryptjs"));
const prisma = new client_1.PrismaClient();
class UserService {
    async getProfile(userId) {
        const user = prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });
        if (!user)
            throw new error_1.BadRequestException("User not found");
        return user;
    }
    async updateProfile(userId, data) {
        return prisma.user.update({ where: { id: userId }, data });
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new error_1.BadRequestException("User not found");
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new error_1.UnauthorizedException("Current password is incorrect");
        }
        const isSamePassword = await bcryptjs_1.default.compare(newPassword, user.passwordHash);
        if (isSamePassword) {
            throw new error_1.BadRequestException("New password must be different from current password");
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    passwordHash,
                },
            }),
            // Force logout on all devices
            prisma.refreshToken.deleteMany({
                where: {
                    userId,
                },
            }),
            prisma.session.updateMany({
                where: {
                    userId,
                },
                data: {
                    isActive: false,
                },
            }),
        ]);
        return {
            message: "Password changed successfully. Please log in again.",
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map