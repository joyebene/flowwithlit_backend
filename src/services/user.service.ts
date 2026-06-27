import { BadRequestException, UnauthorizedException } from "@/utils/error";
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class UserService {

    async getProfile(userId: string) {
        const user = prisma.user.findUnique({ where: { id: userId }, include: { accounts: true } });

        if (!user) throw new BadRequestException("User not found")

        return user;

    }

    async updateProfile(userId: string, data: {
        firstName?: string,
        lastName?: string,
        phone?: string,
        profileImage?: string,
    }) {
        return prisma.user.update({ where: { id: userId }, data })
    }

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException("User not found");
        }

        const isValidPassword = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );

        if (!isValidPassword) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.passwordHash
        );

        if (isSamePassword) {
            throw new BadRequestException(
                "New password must be different from current password"
            );
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

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
            message:
                "Password changed successfully. Please log in again.",
        };
    }

}