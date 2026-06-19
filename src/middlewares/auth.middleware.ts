import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedException } from '@/utils/error';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const decoded = verifyToken(token) as {
      sub: string;
    };

    (req as any).user = {
      id: decoded.sub,
    };

    next();
  } catch (error) {
    next(error);
  }
};