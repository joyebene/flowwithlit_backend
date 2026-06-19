"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKycStatus = exports.submitKyc = void 0;
const kyc_1 = require("@/dto/kyc");
const kyc_service_1 = require("@/services/kyc.service");
const kycService = new kyc_service_1.KycService();
const submitKyc = async (req, res, next) => {
    try {
        const validated = kyc_1.submitKycSchema.parse(req.body);
        const result = await kycService.submitKyc(req.user.id, validated);
        res.json({
            status: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitKyc = submitKyc;
const getKycStatus = async (req, res, next) => {
    try {
        const result = await kycService.getStatus(req.user.id);
        res.json({
            status: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getKycStatus = getKycStatus;
//# sourceMappingURL=kyc.controller.js.map