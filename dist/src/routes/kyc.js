"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kyc_controller_1 = require("@/controllers/kyc.controller");
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/submit", auth_middleware_1.protect, kyc_controller_1.submitKyc);
router.get("/status", auth_middleware_1.protect, kyc_controller_1.getKycStatus);
exports.default = router;
//# sourceMappingURL=kyc.js.map