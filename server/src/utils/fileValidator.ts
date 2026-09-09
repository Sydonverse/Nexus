import path from 'path';
import fs from 'fs';

// Maximum allowed file size: 25MB (26,214,400 bytes)
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

// Dangerous executable and script extensions that pose security risks
const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
  '.vbs',
  '.dll',
  '.scr',
  '.msi',
  '.com',
  '.pif',
  '.hta',
  '.cpl',
  '.inf',
  '.reg',
  '.ws',
  '.wsf',
  '.jar',
  '.jsp',
  '.php',
  '.cgi',
  '.pl',
]);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename: string;
}

/**
 * Sanitize a filename to prevent directory traversal and special character attacks
 */
export const sanitizeFilename = (originalName: string): string => {
  // Strip null bytes and control chars
  let cleaned = originalName.replace(/\0/g, '');
  // Extract basename to prevent path traversal
  cleaned = path.basename(cleaned);
  // Replace unsafe characters with underscore, keeping alphanumeric, dots, dashes, and underscores
  cleaned = cleaned.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Truncate to reasonable length
  if (cleaned.length > 120) {
    const ext = path.extname(cleaned);
    const base = path.basename(cleaned, ext).slice(0, 120 - ext.length);
    cleaned = `${base}${ext}`;
  }
  return cleaned || 'upload.bin';
};

/**
 * Validates file safety based on size, extension, and magic bytes
 */
export const validateFileSafety = (
  fileBuffer: Buffer | null,
  filePath: string | null,
  originalFilename: string,
  fileSizeBytes: number
): ValidationResult => {
  const sanitized = sanitizeFilename(originalFilename);
  const ext = path.extname(sanitized).toLowerCase();

  // 1. Check size limit (25MB)
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds the 25MB efficiency limit (File is ${(fileSizeBytes / (1024 * 1024)).toFixed(2)}MB)`,
      sanitizedFilename: sanitized,
    };
  }

  // 2. Check extension blocklist
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      error: `Security Alert: Executable or script files (${ext}) are strictly blocked to protect the platform.`,
      sanitizedFilename: sanitized,
    };
  }

  // 3. Inspect magic bytes for dangerous executable signatures disguised under another extension
  let bufferToCheck: Buffer | null = fileBuffer;
  if (!bufferToCheck && filePath && fs.existsSync(filePath)) {
    try {
      const fd = fs.openSync(filePath, 'r');
      const buf = Buffer.alloc(16);
      fs.readSync(fd, buf, 0, 16, 0);
      fs.closeSync(fd);
      bufferToCheck = buf;
    } catch {
      // Ignore read error if file can't be opened
    }
  }

  if (bufferToCheck && bufferToCheck.length >= 4) {
    // Windows PE / DOS executable: "MZ" (0x4D 0x5A)
    if (bufferToCheck[0] === 0x4d && bufferToCheck[1] === 0x5a) {
      return {
        isValid: false,
        error: 'Security Alert: File signature matches a Windows executable (MZ header). Upload rejected.',
        sanitizedFilename: sanitized,
      };
    }

    // Linux / Unix ELF binary: 0x7F 'E' 'L' 'F' (0x7F 0x45 0x4C 0x46)
    if (
      bufferToCheck[0] === 0x7f &&
      bufferToCheck[1] === 0x45 &&
      bufferToCheck[2] === 0x4c &&
      bufferToCheck[3] === 0x46
    ) {
      return {
        isValid: false,
        error: 'Security Alert: File signature matches a Unix/Linux executable binary (ELF header). Upload rejected.',
        sanitizedFilename: sanitized,
      };
    }

    // Mach-O binary (macOS): 0xCA 0xFE 0xBA 0xBE or 0xCE 0xFA 0xED 0xFE or 0xCF 0xFA 0xED 0xFE
    if (
      (bufferToCheck[0] === 0xca && bufferToCheck[1] === 0xfe && bufferToCheck[2] === 0xba && bufferToCheck[3] === 0xbe) ||
      (bufferToCheck[0] === 0xcf && bufferToCheck[1] === 0xfa && bufferToCheck[2] === 0xed && bufferToCheck[3] === 0xfe) ||
      (bufferToCheck[0] === 0xce && bufferToCheck[1] === 0xfa && bufferToCheck[2] === 0xed && bufferToCheck[3] === 0xfe)
    ) {
      // Exclude Java class files if .class or .jar (though .jar is already blocked by extension)
      return {
        isValid: false,
        error: 'Security Alert: File signature matches a Mach-O executable binary. Upload rejected.',
        sanitizedFilename: sanitized,
      };
    }
  }

  return {
    isValid: true,
    sanitizedFilename: sanitized,
  };
};
