import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { userService } from '../services/userService.js';
import { config } from '../config/index.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import { AuditLog } from '../models/AuditLog.js';

class AuthController {
  // Register new candidate
  async register(req, res, next) {
    try {
      const { email, password, full_name, referral_code } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new BadRequestError('Email is already registered.'));
      }

      // Generate a unique referral code for this user
      const userReferralCode = await userService.generateUniqueReferralCode();

      // Process referral code if used
      let referredBy = null;
      if (referral_code) {
        const referrer = await User.findOne({ referralCode: referral_code.trim().toUpperCase() });
        if (referrer) {
          referredBy = referrer.referralCode;
        }
      }

      // Create new user
      const newUser = await User.create({
        email,
        passwordHash: password, // Pre-save hook hashes this
        fullName: full_name || '',
        referralCode: userReferralCode,
        referredBy
      });

      // Generate credentials tokens
      const accessToken = generateAccessToken(newUser._id);
      const refreshToken = generateRefreshToken(newUser._id);

      // Save refresh token in HttpOnly cookie for extra security
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      await AuditLog.create({
        userId: newUser._id,
        action: 'USER_REGISTERED',
        status: 'success',
        ipAddress: req.ip
      });

      res.status(201).json({
        message: 'User registered successfully',
        token: accessToken,
        user: newUser.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // Authenticate user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        await AuditLog.create({
          action: 'USER_LOGIN_FAILED',
          status: 'failure',
          details: { email },
          ipAddress: req.ip
        });
        return next(new UnauthorizedError('Invalid email or password.'));
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Set cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      await AuditLog.create({
        userId: user._id,
        action: 'USER_LOGGED_IN',
        status: 'success',
        ipAddress: req.ip
      });

      res.status(200).json({
        token: accessToken,
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // Retrieve or update profile
  async getProfile(req, res, next) {
    try {
      res.status(200).json(req.user.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = req.user;
      const { full_name, password } = req.body;

      if (full_name !== undefined) {
        user.fullName = full_name;
      }

      if (password) {
        user.passwordHash = password; // Trigger pre-save hash hook
      }

      await user.save();

      await AuditLog.create({
        userId: user._id,
        action: 'USER_PROFILE_UPDATED',
        status: 'success',
        ipAddress: req.ip
      });

      res.status(200).json(user.toJSON());
    } catch (error) {
      next(error);
    }
  }

  // Forgot password flow
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      // Prevent user enumeration by returning success regardless
      if (!user) {
        return res.status(200).json({
          message: 'If the email exists, a reset code was sent.'
        });
      }

      await AuditLog.create({
        userId: user._id,
        action: 'PASSWORD_RESET_REQUESTED',
        status: 'success',
        ipAddress: req.ip
      });

      res.status(200).json({
        message: 'Reset link sent to your registered email.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh expired access token
  async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken || req.body.refresh_token;

      if (!token) {
        return next(new UnauthorizedError('Refresh token is required.'));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, config.jwtRefreshSecret);
      } catch (err) {
        return next(new UnauthorizedError('Invalid or expired refresh token.'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new UnauthorizedError('User no longer exists.'));
      }

      const newAccessToken = generateAccessToken(user._id);

      res.status(200).json({
        token: newAccessToken
      });
    } catch (error) {
      next(error);
    }
  }

  // Get audit activity logs for user
  async getSecurityLogs(req, res, next) {
    try {
      const logs = await AuditLog.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30);
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
