"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AccountService {
    async getAccounts(userId) {
        return prisma.account.findMany({
            where: {
                userId,
            },
        });
    }
    async getBalances(userId) {
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
exports.AccountService = AccountService;
//# sourceMappingURL=account.service.js.map