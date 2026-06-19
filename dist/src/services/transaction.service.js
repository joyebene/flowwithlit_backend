"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const client_1 = require("@prisma/client");
const error_1 = require("@/utils/error");
const kyc_helper_1 = require("@/services/helpers/kyc.helper");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
class TransactionService {
    async transfer(senderId, recipientId, amount, narration) {
        if (amount <= 0) {
            throw new error_1.BadRequestException("Invalid amount");
        }
        // 1. KYC CHECK (sender only)
        await (0, kyc_helper_1.verifyKycEligibility)(senderId);
        // 2. Fetch accounts
        const senderAccount = await prisma.account.findFirst({
            where: {
                userId: senderId,
                currency: "NGN",
            },
            // lock: { mode: 'for update' }
        });
        if (!senderAccount) {
            throw new error_1.BadRequestException("Sender account not found");
        }
        if (Number(senderAccount.availableBalance) < amount) {
            throw new error_1.BadRequestException("Insufficient balance");
        }
        const recipientAccount = await prisma.account.findFirst({
            where: {
                userId: recipientId,
                currency: "NGN",
            },
        });
        if (!recipientAccount) {
            throw new error_1.BadRequestException("Recipient account not found");
        }
        const reference = crypto_1.default.randomUUID();
        // 3. ATOMIC TRANSACTION
        return prisma.$transaction(async (tx) => {
            // debit sender
            await tx.account.update({
                where: { id: senderAccount.id },
                data: {
                    balance: { decrement: amount },
                    availableBalance: { decrement: amount },
                },
            });
            // credit recipient
            await tx.account.update({
                where: { id: recipientAccount.id },
                data: {
                    balance: { increment: amount },
                    availableBalance: { increment: amount },
                },
            });
            // record transaction (sender)
            const transaction = await tx.transaction.create({
                data: {
                    reference,
                    userId: senderId,
                    amount,
                    currency: "NGN",
                    type: client_1.TransactionType.P2P,
                    status: client_1.TransactionStatus.SUCCESS,
                    description: narration || "P2P Transfer",
                },
            });
            return transaction;
        });
    }
    async getTransactions(userId) {
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return transactions;
    }
}
exports.TransactionService = TransactionService;
//# sourceMappingURL=transaction.service.js.map