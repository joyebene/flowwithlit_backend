"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const user_1 = __importDefault(require("./user"));
const kyc_1 = __importDefault(require("./kyc"));
const account_1 = __importDefault(require("./account"));
const transaction_1 = __importDefault(require("./transaction"));
const rootRoutes = (0, express_1.Router)();
rootRoutes.get('/', (req, res) => {
    res.send('Welcome to the root route!');
});
rootRoutes.use('/auth', auth_1.default);
rootRoutes.use('/user', user_1.default);
rootRoutes.use('/kyc', kyc_1.default);
rootRoutes.use('/account', account_1.default);
rootRoutes.use("/tansaction", transaction_1.default);
exports.default = rootRoutes;
//# sourceMappingURL=rootRoutes.js.map