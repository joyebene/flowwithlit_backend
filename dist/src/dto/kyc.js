"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitKycSchema = void 0;
const zod_1 = require("zod");
exports.submitKycSchema = zod_1.z.object({
    bvn: zod_1.z.string().min(11).max(11),
    nin: zod_1.z.string().min(11).max(11),
    address: zod_1.z.string().min(5),
    dateOfBirth: zod_1.z.string(),
});
//# sourceMappingURL=kyc.js.map