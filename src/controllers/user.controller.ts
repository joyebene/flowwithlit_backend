import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';

const userService = new UserService();

export const getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await userService.getProfile(
            (req as any).user.id
        );

        res.json({
            status: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await userService.updateProfile(
            (req as any).user.id,
            req.body
        );

        res.json({
            status: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const result = await userService.changePassword(
            (req as any).user.id,
            currentPassword,
            newPassword
        );

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({
            status: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};