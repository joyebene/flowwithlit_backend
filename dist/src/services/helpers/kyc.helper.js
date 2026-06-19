"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyKycEligibility = void 0;
const client_1 = require("@prisma/client");
const error_1 = require("@/utils/error");
const prisma = new client_1.PrismaClient();
const verifyKycEligibility = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            kycStatus: true,
            tier: true,
        },
    });
    if (!user) {
        throw new error_1.ForbiddenException("User not found");
    }
    if (user.kycStatus !== client_1.KycStatus.APPROVED) {
        throw new error_1.ForbiddenException("KYC verification required before performing transactions");
    }
    return user;
};
exports.verifyKycEligibility = verifyKycEligibility;
//# sourceMappingURL=kyc.helper.js.map