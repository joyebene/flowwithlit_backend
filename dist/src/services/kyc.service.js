"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const client_1 = require("@prisma/client");
const error_1 = require("@/utils/error");
const youverify_service_1 = require("./providers/youverify.service");
const prisma = new client_1.PrismaClient();
const provider = new youverify_service_1.YouVerifyService();
class KycService {
    async submitKyc(userId, data) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new error_1.BadRequestException("User not found");
        }
        const bvnResult = await provider.verifyBVN(data.bvn);
        if (!bvnResult.status) {
            throw new error_1.BadRequestException("BVN verification failed");
        }
        const ninResult = await provider.verifyNIN(data.nin);
        if (!ninResult.status) {
            throw new error_1.BadRequestException("NIN verification failed");
        }
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                bvn: data.bvn,
                nin: data.nin,
                address: data.address,
                dateOfBirth: new Date(data.dateOfBirth),
                tier: client_1.Tier.VERIFIED,
                kycStatus: client_1.KycStatus.APPROVED,
                kycSubmittedAt: new Date(),
                kycApprovedAt: new Date(),
            },
        });
        return updatedUser;
    }
    async getStatus(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                tier: true,
                kycStatus: true,
                kycSubmittedAt: true,
                kycApprovedAt: true,
            },
        });
        return user;
    }
}
exports.KycService = KycService;
//# sourceMappingURL=kyc.service.js.map