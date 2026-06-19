"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactios = exports.transfer = void 0;
const transaction_service_1 = require("@/services/transaction.service");
const zod_1 = require("zod");
const transactionService = new transaction_service_1.TransactionService();
const transferSchema = zod_1.z.object({
    recipientId: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    narration: zod_1.z.string().optional(),
});
const transfer = async (req, res, next) => {
    try {
        const validated = transferSchema.parse(req.body);
        const result = await transactionService.transfer(req.user.id, validated.recipientId, validated.amount, validated.narration);
        res.json({
            status: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.transfer = transfer;
const getTransactios = async (req, res, next) => {
    try {
        const transactions = await transactionService.getTransactions(req.user.id);
        res.json({
            status: true,
            data: transactions
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransactios = getTransactios;
//# sourceMappingURL=transaction.controller.js.map