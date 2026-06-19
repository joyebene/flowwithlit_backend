"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("@/controllers/user.controller");
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/me', auth_middleware_1.protect, user_controller_1.getProfile);
router.patch('/me', auth_middleware_1.protect, user_controller_1.updateProfile);
router.patch('/chnage-password', user_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=user.js.map