import bcrypt from 'bcrypt';
import { PrismaClient, OtpPurpose } from '@prisma/client';
import { LoginDto, RegisterDto } from '@/dto/auth';
import { BadRequestException, ConflictException, UnauthorizedException } from '@/utils/error';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';
import { generateOtp } from '@/utils/helper';
import redis from '@/config/redis';
import crypto from "crypto";
import { sendEmail } from './providers/email.service';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new ConflictException('User already exists');

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName
      },
    });

    // Create default NGN account
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'FIAT',
        currency: 'NGN',
      },
    });

    // Request an OTP for email verification upon registration
    await this.requestOtp(user.email, OtpPurpose.EMAIL_VERIFICATION);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    //hash refreshToken
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Store in Redis
    await redis.set(`refresh:${refreshToken}`, user.id, { EX: 7 * 24 * 60 * 60 });

    // Optional: Store in DB too for extra persistence
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Rate limiting
    const attemptsKey = `login:attempts:${user.id}`;
    const attempts = await redis.incr(attemptsKey);
    if (attempts > 5) throw new BadRequestException('Too many login attempts. Try again later.');

    await redis.expire(attemptsKey, 300); // 5 minutes

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id, data.deviceFingerprint);
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await redis.set(`refresh:${refreshToken}`, user.id, { EX: 7 * 24 * 60 * 60 });

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }


  async refreshToken(refreshToken: string) {
    // Hash incoming refresh token
    const tokenHash = crypto.createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Find token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException(
        'Invalid or expired refresh token'
      );
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Refresh token expired'
      );
    }

    // Remove old token from Redis
    await redis.del(`refresh:${refreshToken}`);

    // Delete old token from database
    await prisma.refreshToken.delete({
      where: {
        tokenHash,
      },
    });

    // Generate new tokens
    const accessToken = generateAccessToken(
      storedToken.userId
    );

    const newRefreshToken = generateRefreshToken(
      storedToken.userId
    );

    // Hash new refresh token
    const newTokenHash = crypto.createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    // Store in Redis
    await redis.set(
      `refresh:${newRefreshToken}`,
      storedToken.userId,
      {
        EX: 7 * 24 * 60 * 60,
      }
    );

    // Store hash in DB
    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: storedToken.userId,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
  async requestOtp(email: string, purpose: OtpPurpose) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new BadRequestException('Err.');

    const code = generateOtp(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update an existing OTP for this purpose
    await prisma.otp.upsert({
      where: { userId_purpose: { userId: user.id, purpose } },
      update: { code, expiresAt },
      create: { userId: user.id, code, expiresAt, purpose },
    });

    const emailHtml = `<p>Your OTP is: <strong>${code}</strong></p>`;

    await sendEmail({
      to: email,
      subject: 'Your One-Time Password',
      html: emailHtml,
    });

    return { message: `An OTP has been sent to ${email}. It will expire in 10 minutes.` };
  }

  async verifyEmail(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new BadRequestException('Invalid request.');

    const otp = await prisma.otp.findUnique({
      where: { userId_purpose: { userId: user.id, purpose: OtpPurpose.EMAIL_VERIFICATION } },
    });

    if (!otp || otp.code !== code) {
      throw new BadRequestException('Invalid or incorrect OTP.');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Use a transaction to update user and delete OTP
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
      prisma.otp.delete({
        where: { id: otp.id },
      }),
    ]);

    return { message: 'Email verified successfully.' };
  }

  async verifyOtpAndResetPassword(email: string, code: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new BadRequestException('Invalid request.');

    const otp = await prisma.otp.findUnique({
      where: { userId_purpose: { userId: user.id, purpose: OtpPurpose.FORGOT_PASSWORD } },
    });

    if (!otp || otp.code !== code) {
      throw new BadRequestException('Invalid or incorrect OTP.');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Use a transaction to update password and delete OTP atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.otp.delete({
        where: { id: otp.id },
      }),
    ]);

    return { message: 'Password has been reset successfully.' };
  }

  async logout(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await Promise.all([
      redis.del(`refresh:${refreshToken}`),
      prisma.refreshToken.deleteMany({
        where: {
          tokenHash,
        },
      }),
    ]);
  }
}