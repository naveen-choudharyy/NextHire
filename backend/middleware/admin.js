import { ForbiddenError } from '../utils/errors.js';

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('Access denied. Admin role required.'));
  }
  next();
};
