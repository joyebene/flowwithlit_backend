import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AccountService {
  async getAccounts(userId: string) {
    return prisma.account.findMany({
      where: {
        userId,
      },
    });
  }

  async getBalances(userId: string) {
    return prisma.account.findMany({
      where: {
        userId,
      },
      select: {
        currency: true,
        balance: true,
        availableBalance: true,
      },
    });
  }
}