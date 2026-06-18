import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { config } from '../config/index.js';
import { AuditLog } from '../models/AuditLog.js';

const handleCastErrorDB = err => {
  return new AppError(`Invalid value for ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = Object.keys(err.keyValue || {}).map(k => `${k}: ${err.keyValue[k]}`).join(', ');
  return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Your session has expired. Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  logger.error(`Error in Dev: ${err.message}`, { stack: err.stack, path: req.originalUrl });
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = async (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err.message
    });
  } else {
    // Programming or other unknown error: don't leak details
    logger.error('CRITICAL UNHANDLED ERROR:', err);

    // Audit log critical system issues
    try {
      await AuditLog.create({
        action: 'UNHANDLED_CRITICAL_ERROR',
        status: 'failure',
        details: { message: err.message, path: req.originalUrl }
      });
    } catch (e) {
      logger.error(`Audit logging failed: ${e.message}`);
    }

    res.status(500).json({
      status: 'error',
      error: 'Something went wrong on our server. Please try again later.'
    });
  }
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;
    error.stack = err.stack;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
