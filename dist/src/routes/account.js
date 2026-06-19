"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const account_controller_1 = require("@/controllers/account.controller");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.protect, account_controller_1.getAccounts);
router.get("/balances", auth_middleware_1.protect, account_controller_1.getBalances);
exports.default = router;
//# sourceMappingURL=account.js.map