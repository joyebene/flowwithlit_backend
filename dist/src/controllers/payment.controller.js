"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVirtualAccount = void 0;
const payment_service_1 = require("@/services/payment.service");
const paymentService = new payment_service_1.PaymentService();
const createVirtualAccount = async (req, res) => {
    const result = await paymentService.createVirtualAccount(req.user.id);
    res.json({
        status: true,
        data: result,
    });
};
exports.createVirtualAccount = createVirtualAccount;
//# sourceMappingURL=payment.controller.js.map