"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const palmpay_service_1 = require("./providers/palmpay.service");
const prisma = new client_1.PrismaClient();
const palmpay = new palmpay_service_1.PalmPayService();
class PaymentService {
    async createVirtualAccount(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new Error("User not found");
        // check if already exists
        const existing = await prisma.virtualAccount.findUnique({
            where: { userId },
        });
        if (existing)
            return existing;
        //call provider
        const response = await palmpay.createVirtualAccount({
            name: `${user.firstName} ${user.lastName}`,
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
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map