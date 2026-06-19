"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalances = exports.getAccounts = void 0;
const account_service_1 = require("@/services/account.service");
const accountService = new account_service_1.AccountService();
const getAccounts = async (req, res, next) => {
    try {
        const accounts = await accountService.getAccounts(req.user.id);
        res.json({
            status: true,
            data: accounts,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAccounts = getAccounts;
const getBalances = async (req, res, next) => {
    try {
        const balances = await accountService.getBalances(req.user.id);
        res.json({
            status: true,
            data: balances,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBalances = getBalances;
//# sourceMappingURL=account.controller.js.map