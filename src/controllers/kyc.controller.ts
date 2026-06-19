import { Request, Response, NextFunction } from "express";
import { submitKycSchema } from "@/dto/kyc";
import { KycService } from "@/services/kyc.service";

const kycService = new KycService();

export const submitKyc = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validated = submitKycSchema.parse(req.body);

        const result = await kycService.submitKyc(
            (req as any).user.id,
            validated
        );

        res.json({
            status: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getKycStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await kycService.getStatus(
            (req as any).user.id
        );

        res.json({
            status: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};