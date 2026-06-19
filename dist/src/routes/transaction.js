"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const transaction_controller_1 = require("@/controllers/transaction.controller");
const router = (0, express_1.Router)();
router.post("/transfer", auth_middleware_1.protect, transaction_controller_1.transfer);
router.get('/', transaction_controller_1.getTransactios);
exports.default = router;
//# sourceMappingURL=transaction.js.map