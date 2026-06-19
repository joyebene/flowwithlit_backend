"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PalmPayService = void 0;
const axios_1 = __importDefault(require("axios"));
class PalmPayService {
    baseUrl = process.env.PALMPAY_BASE_URL;
    apiKey = process.env.PALMPAY_API_KEY;
    async createVirtualAccount(data) {
        const response = await axios_1.default.post(`${this.baseUrl}/virtual-account/create`, data, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    async initiateTransfer(data) {
        const response = await axios_1.default.post(`${this.baseUrl}/transfer`, data, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
        });
        return response.data;
    }
}
exports.PalmPayService = PalmPayService;
//# sourceMappingURL=palmpay.service.js.map