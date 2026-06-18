import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { UnauthorizedError } from '../utils/errors.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtRefreshSecret, { expiresIn: '7d' });
};

export const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.refreshToken) {
    // Optional fallback: check cookie (primarily for refresh requests)
    token = req.cookies.refreshToken;
  }

  if (!token) {
    return next(new UnauthorizedError('Please log in to access this resource.'));
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists.'));
    }

    // 4. Attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid token. Please log in again.'));
  }
};

// Optional: for routes that can be accessed publicly but will show extra info if logged in (like optional JWT in Python)
export const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const currentUser = await User.findById(decoded.id);
    if (currentUser) {
      req.user = currentUser;
    }
  } catch (error) {
    // Do nothing, proceed as guest
  }
  next();
};
