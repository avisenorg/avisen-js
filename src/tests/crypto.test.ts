import {generateECDSAKeys, sign} from "../crypto/crypto";

describe('crypto', () => {
  describe('sign', () => {
    it('should sign payload', async () => {
      const keyPair = generateECDSAKeys();

      expect(isValidBase64(sign(Buffer.from(keyPair.privateKey, 'base64'), 'test'))).toBe(true);
    });
  })
})

/**
 * Validates if a string is properly formatted base64
 * @param str The string to validate
 * @returns boolean indicating if the string is valid base64
 */
export function isValidBase64(str: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(str);
}