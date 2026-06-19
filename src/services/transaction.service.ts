import {
    PrismaClient,
    TransactionType,
    TransactionStatus,
} from "@prisma/client";

import { BadRequestException } from "@/utils/error";
import { verifyKycEligibility } from "@/services/helpers/kyc.helper";
import crypto from "crypto";

const prisma = new PrismaClient();

export class TransactionService {
    async transfer(
        senderId: string,
        recipientId: string,
        amount: number,
        narration?: string
    ) {
        if (amount <= 0) {
            throw new BadRequestException("Invalid amount");
        }

        // 1. KYC CHECK (sender only)
        await verifyKycEligibility(senderId);

        // 2. Fetch accounts
        const senderAccount = await prisma.account.findFirst({
            where: {
                userId: senderId,
                currency: "NGN",
            },
            // lock: { mode: 'for update' }
        });

        if (!senderAccount) {
            throw new BadRequestException("Sender account not found");
        }

        if (Number(senderAccount.availableBalance) < amount) {
            throw new BadRequestException("Insufficient balance");
        }

        const recipientAccount = await prisma.account.findFirst({
            where: {
                userId: recipientId,
                currency: "NGN",
            },
        });

        if (!recipientAccount) {
            throw new BadRequestException("Recipient account not found");
        }

        const reference = crypto.randomUUID();

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
                    type: TransactionType.P2P,
                    status: TransactionStatus.SUCCESS,
                    description: narration || "P2P Transfer",
                },
            });

            return transaction;
        });
    }
    async getTransactions(userId: string) {
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return transactions;

    }
}