"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_controller_1 = require("@/controllers/payment.controller");
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const palmpay_webhook_1 = require("@/webhooks/palmpay.webhook");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/virtual-account", auth_middleware_1.protect, payment_controller_1.createVirtualAccount);
//webhook
router.post("/webhook/palmpay", palmpay_webhook_1.palmpayWebhook);
//# sourceMappingURL=payment.js.map