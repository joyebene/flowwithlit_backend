import { Router } from "express";
import { protect } from "@/middlewares/auth.middleware";
import { getTransactios, transfer } from "@/controllers/transaction.controller";

const router = Router();

router.post("/transfer", protect, transfer);
router.get('/', getTransactios);

export default router;