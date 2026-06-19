"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ sub: userId }, JWT_SECRET, { expiresIn: '15m' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, deviceFingerprint) => {
    return jsonwebtoken_1.default.sign({ sub: userId, device: deviceFingerprint }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token, isRefresh = false) => {
    const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map