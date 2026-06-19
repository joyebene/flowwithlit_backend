import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const palmpayWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // 1. VERIFY SIGNATURE (CRITICAL SECURITY)
    const signature = req.headers["x-palmpay-signature"] as string;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.PALMPAY_SECRET!)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (!signature || signature !== expectedSignature) {
      return res.status(401).json({
        status: false,
        message: "Invalid signature",
      });
    }

    // 2. EXTRACT DATA
    const {
      reference,
      amount,
      accountNumber,
      status,
    } = payload;

    if (status !== "SUCCESS") {
      return res.json({
        status: true,
        message: "Ignored non-success transaction",
      });
    }

    // 3. FIND CORRECT VIRTUAL ACCOUNT (FIXED)
    const virtualAccount = await prisma.virtualAccount.findUnique({
      where: {
        accountNumber,
      },
      include: {
        user: true,
      },
    });

    if (!virtualAccount) {
      return res.status(404).json({
        status: false,
        message: "Virtual account not found",
      });
    }

    // 4. IDEMPOTENCY CHECK (PREVENT DOUBLE CREDIT)
    const existing = await prisma.transaction.findUnique({
      where: { reference },
    });

    if (existing) {
      return res.json({
        status: true,
        message: "Duplicate transaction ignored",
      });
    }

    // 5. CREDIT WALLET SAFELY (ATOMIC TRANSACTION)
    await prisma.$transaction(async (tx) => {
      // credit user wallet
      await tx.account.updateMany({
        where: {
          userId: virtualAccount.userId,
          currency: "NGN",
        },
        data: {
          balance: { increment: amount },
          availableBalance: { increment: amount },
        },
      });

      // create transaction record
      await tx.transaction.create({
        data: {
          reference,
          userId: virtualAccount.userId,
          amount,
          currency: "NGN",
          type: "DEPOSIT",
          status: "SUCCESS",
          description: "PalmPay Deposit",
        },
      });
    });

    return res.json({
      status: true,
      message: "Credit successful",
    });
  } catch (error) {
    console.error("PalmPay Webhook Error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};