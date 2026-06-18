import crypto from 'crypto';
import { config } from '../config/index.js';
import { logger } from './logger.js';

// Derived 32-byte key from JWT Secret to ensure consistency and correct length
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(config.jwtSecret || 'default_sec_key_12345678901234567890')
  .digest();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV is standard for GCM

/**
 * Encrypt plain text using AES-256-GCM
 * Returns hex representation formatted as "iv:authTag:ciphertext"
 */
export function encrypt(text) {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    logger.error(`Encryption failed: ${error.message}`);
    return text; // Fallback to plain text on failure
  }
}

/**
 * Decrypt ciphertext formatted as "iv:authTag:ciphertext"
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return '';
  
  // If the text does not match our encrypted format, return it as-is
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    return encryptedText; 
  }
  
  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Return original text if decryption fails (e.g., integrity mismatch or already plaintext)
    logger.warn(`Decryption failed: ${error.message}. Returning original value.`);
    return encryptedText;
  }
}
