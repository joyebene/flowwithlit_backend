import { Request, Response, NextFunction } from "express";
import { TransactionService } from "@/services/transaction.service";
import { z } from "zod";

const transactionService = new TransactionService();

const transferSchema = z.object({
    recipientId: z.string(),
    amount: z.number().positive(),
    narration: z.string().optional(),
});

export const transfer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validated = transferSchema.parse(req.body);

        const result = await transactionService.transfer(
            (req as any).user.id,
            validated.recipientId,
            validated.amount,
            validated.narration
        );

        res.json({
            status: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getTransactios = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactions = await transactionService.getTransactions((req as any).user.id);

        res.json({
            status: true,
            data: transactions
        })
    } catch (error) {
        next(error);
    }
}