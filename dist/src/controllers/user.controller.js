"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const user_service_1 = require("@/services/user.service");
const userService = new user_service_1.UserService();
const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getProfile(req.user.id);
        res.json({
            status: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        res.json({
            status: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({
            status: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=user.controller.js.map