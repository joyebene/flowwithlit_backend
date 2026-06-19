import { Request, Response } from "express";
import { PaymentService } from "@/services/payment.service";

const paymentService = new PaymentService();

export const createVirtualAccount = async (req: Request, res: Response) => {
  const result = await paymentService.createVirtualAccount(
    (req as any).user.id
  );

  res.json({
    status: true,
    data: result,
  });
};