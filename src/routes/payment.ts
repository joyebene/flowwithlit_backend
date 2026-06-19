import { createVirtualAccount } from "@/controllers/payment.controller";
import { protect } from "@/middlewares/auth.middleware";
import { palmpayWebhook } from "@/webhooks/palmpay.webhook";
import { Router } from "express";

const router = Router();

router.post(
  "/virtual-account",
  protect,
  createVirtualAccount
);

//webhook
router.post("/webhook/palmpay", palmpayWebhook);