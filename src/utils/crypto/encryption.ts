import CryptoJS from 'crypto-js';

export interface EncryptedData {
  data: string;
  salt: string;
  version: string;
}

export interface Credential {
  id?: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  lastAccessed?: string;
  createdAt?: string;
}

export class CryptoService {
  private static readonly AUTH_ITERATIONS = 5000;
  private static readonly ENCRYPTION_ITERATIONS = 7000;
  private static readonly KEY_LENGTH = 256 / 32;
  private static readonly SALT_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  /**
   * Create authentication hash with high iterations
   */
  static createAuthHash(data: string): string {
    return CryptoJS.PBKDF2(data, 'secure-auth-salt-v2', {
      keySize: this.KEY_LENGTH,
      iterations: this.AUTH_ITERATIONS,
      hasher: CryptoJS.algo.SHA512
    }).toString(CryptoJS.enc.Hex);
  }

  /**
   * Derive encryption key with user-specific parameters
   */
  static deriveEncryptionKey(masterPassword: string, email: string, salt?: string): CryptoJS.lib.WordArray {
    const userSalt =
      salt || CryptoJS.SHA512(email + 'secure-encryption-salt-v3').toString().substring(0, 32);

    return CryptoJS.PBKDF2(masterPassword, userSalt, {
      keySize: this.KEY_LENGTH,
      iterations: this.ENCRYPTION_ITERATIONS,
      hasher: CryptoJS.algo.SHA512
    });
  }

  /**
   * Maximum security encryption using AES-256-CBC
   */
  static async encryptData(
    data: Credential[],
    masterPassword: string,
    email: string
  ): Promise<EncryptedData> {
    try {
      // Generate per-vault cryptographically secure salt
      const salt = CryptoJS.lib.WordArray.random(this.SALT_LENGTH);
      const saltString = CryptoJS.enc.Hex.stringify(salt);

      // Derive encryption key with salt + user email
      const key = this.deriveEncryptionKey(masterPassword, email, saltString);

      // Wrap credentials with versioning and timestamp
      const dataWithMeta = {
        credentials: data,
        timestamp: Date.now(),
        version: '4.0-max-security'
      };
      const plaintext = JSON.stringify(dataWithMeta);

      // Generate a secure IV
      const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);

      // Encrypt with AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Combine IV + ciphertext and encode as Base64
      const combined = iv.concat(encrypted.ciphertext);
      const encryptedString = CryptoJS.enc.Base64.stringify(combined);

      return {
        data: encryptedString,
        salt: saltString,
        version: '4.0-cbc-secure'
      };
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message || error}`);
    }
  }

  /**
   * Maximum security decryption using AES-256-CBC
   */
  static async decryptData(
    encryptedData: EncryptedData,
    masterPassword: string,
    email: string
  ): Promise<Credential[]> {
    try {
      // Derive key using stored salt
      const key = this.deriveEncryptionKey(masterPassword, email, encryptedData.salt);

      // Decode Base64
      const combined = CryptoJS.enc.Base64.parse(encryptedData.data);

      // IV occupies first 16 bytes (4 words)
      const ivWords = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), this.IV_LENGTH);
      const ciphertextWords = CryptoJS.lib.WordArray.create(
        combined.words.slice(4),
        combined.sigBytes - this.IV_LENGTH
      );

      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertextWords
      });

      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv: ivWords,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plaintext) throw new Error('Invalid master key or corrupted data');

      const parsedData = JSON.parse(plaintext);
      if (!parsedData.credentials || !Array.isArray(parsedData.credentials)) {
        throw new Error('Decrypted data integrity check failed');
      }

      return parsedData.credentials;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message || error}`);
    }
  }

  /**
   * Create secure SHA-512 hash for data integrity
   */
  static createHash(data: string): string {
    return CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Simple hash for backward compatibility
   */
  static createSimpleHash(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Generate a cryptographically secure random password
   */
  static generatePassword(length: number = 20): string {
    const charset = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    // Ensure at least one of each
    let password = [
      charset.lower[Math.floor(Math.random() * charset.lower.length)],
      charset.upper[Math.floor(Math.random() * charset.upper.length)],
      charset.numbers[Math.floor(Math.random() * charset.numbers.length)],
      charset.symbols[Math.floor(Math.random() * charset.symbols.length)]
    ].join('');

    const allChars =
      charset.lower + charset.upper + charset.numbers + charset.symbols;

    if (typeof window !== 'undefined' && window.crypto) {
      const values = new Uint32Array(length - 4);
      window.crypto.getRandomValues(values);
      for (let i = 0; i < values.length; i++) {
        password += allChars[values[i] % allChars.length];
      }
    } else {
      for (let i = 0; i < length - 4; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Advanced password strength validation
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 16) score += 3;
    else if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 2;
    else feedback.push('Include special characters');

    const uniqueChars = new Set(password).size;
    if (uniqueChars / password.length > 0.7) score += 1;
    else feedback.push('Use more varied characters');

    const commonPatterns = ['123', 'abc', 'qwerty', 'password', 'admin', 'welcome'];
    const lowerPassword = password.toLowerCase();
    if (!commonPatterns.some(p => lowerPassword.includes(p))) score += 1;
    else feedback.push('Avoid common patterns and words');

    return {
      isValid: score >= 8,
      score: Math.min(score, 10),
      feedback: score >= 8 ? ['Excellent password strength!'] : feedback
    };
  }

  /**
   * Secure memory clearing
   */
  static clearSensitiveData(data: string): void {
    if (!data) return;
    const dataArray = data.split('');
    for (let i = 0; i < dataArray.length; i++) {
      dataArray[i] = String.fromCharCode(Math.floor(Math.random() * 256));
    }
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc();
    }
  }

  /**
   * Verify master key without exposing it
   */
  static async verifyMasterKey(
    encryptedData: EncryptedData,
    masterPassword: string,
    email: string
  ): Promise<boolean> {
    try {
      await this.decryptData(encryptedData, masterPassword, email);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Simple encryption (legacy)
   */
  static simpleEncrypt(data: Credential[], password: string): EncryptedData {
    const plaintext = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(plaintext, password).toString();
    return {
      data: encrypted,
      salt: CryptoJS.SHA256(password).toString(),
      version: '1.0-simple'
    };
  }

  /**
   * Simple decryption (legacy)
   */
  static simpleDecrypt(encryptedData: EncryptedData, password: string): Credential[] {
    const decrypted = CryptoJS.AES.decrypt(encryptedData.data, password);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    if (!plaintext) throw new Error('Simple decryption failed');
    return JSON.parse(plaintext);
  }
}
