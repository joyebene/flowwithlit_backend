import { KycStatus, PrismaClient } from "@prisma/client";
import { ForbiddenException } from "@/utils/error";

const prisma = new PrismaClient();

export const verifyKycEligibility = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      kycStatus: true,
      tier: true,
    },
  });

  if (!user) {
    throw new ForbiddenException("User not found");
  }

  if (user.kycStatus !== KycStatus.APPROVED) {
    throw new ForbiddenException(
      "KYC verification required before performing transactions"
    );
  }

  return user;
};