import { Router } from "express";
import { protect } from "@/middlewares/auth.middleware";
import {
  getAccounts,
  getBalances,
} from "@/controllers/account.controller";

const router = Router();

router.get("/", protect, getAccounts);
router.get("/balances", protect, getBalances);

export default router;