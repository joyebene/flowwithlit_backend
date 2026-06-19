import { PrismaClient } from "@prisma/client";
import { PalmPayService } from "./providers/palmpay.service";

const prisma = new PrismaClient();
const palmpay = new PalmPayService();

export class PaymentService {
    async createVirtualAccount(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new Error("User not found");

        // check if already exists
        const existing = await prisma.virtualAccount.findUnique({
            where: { userId },
        });

        if (existing) return existing;

        //call provider
        const response = await palmpay.createVirtualAccount({
            name: user.fullName!,
            email: user.email,
            phone: user.phone || ""
        });

        // save in DB
        const virtualAccount = await prisma.virtualAccount.create({
            data: {
                userId: user.id,
                accountNumber: response.data.accountNumber,
                bankName: response.data.bankName || "PalmPay",
                provider: "PALMPAY",
            },
        });


        return virtualAccount;
    }
}