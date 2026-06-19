import { PrismaClient, KycStatus, Tier } from "@prisma/client";
import { BadRequestException } from "@/utils/error";
import { SubmitKycDto } from "@/dto/kyc";
import { YouVerifyService } from "./providers/youverify.service";

const prisma = new PrismaClient();

const provider = new YouVerifyService();

export class KycService {
    async submitKyc(userId: string, data: SubmitKycDto) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException("User not found");
        }

        const bvnResult = await provider.verifyBVN(data.bvn);

        if (!bvnResult.status) {
            throw new BadRequestException("BVN verification failed");
        }

        const ninResult = await provider.verifyNIN(data.nin);

        if (!ninResult.status) {
            throw new BadRequestException("NIN verification failed");
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

                tier: Tier.VERIFIED,
                kycStatus: KycStatus.APPROVED,

                kycSubmittedAt: new Date(),
                kycApprovedAt: new Date(),
            },
        });

        return updatedUser;
    }

    async getStatus(userId: string) {
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