import { Request, Response, NextFunction } from "express";
import { AccountService } from "@/services/account.service";

const accountService = new AccountService();

export const getAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accounts = await accountService.getAccounts(
      (req as any).user.id
    );

    res.json({
      status: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getBalances = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const balances = await accountService.getBalances(
      (req as any).user.id
    );

    res.json({
      status: true,
      data: balances,
    });
  } catch (error) {
    next(error);
  }
};