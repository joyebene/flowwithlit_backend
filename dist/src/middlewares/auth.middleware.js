"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const error_1 = require("@/utils/error");
const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            throw new error_1.UnauthorizedException('No token provided');
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = {
            id: decoded.sub,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.middleware.js.map