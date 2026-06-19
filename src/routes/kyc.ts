import { Router } from "express";
import {
  submitKyc,
  getKycStatus,
} from "@/controllers/kyc.controller";
import { protect } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/submit", protect, submitKyc);
router.get("/status", protect, getKycStatus);

export default router;