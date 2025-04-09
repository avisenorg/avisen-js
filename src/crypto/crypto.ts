import * as crypto from 'crypto';
import {createSign, createVerify} from "node:crypto";

export interface HashContent {
  content: string;
}

export interface SigningPayload {
  privateKey: string;
  data: string;
}

interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export function generateHash(input: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(input);

  return hash.digest('hex')
}

/**
 * Generates an ECDSA key pair using the prime192v1 curve (secp192r1)
 * @returns {KeyPair} An object containing the base64-encoded private and public keys
 * @throws {Error} If key generation fails
 */
export function generateECDSAKeys(): KeyPair {
  try {
    const keyPair = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime192v1', // This is secp192r1 curve
      publicKeyEncoding: {
        type: 'spki',    // SubjectPublicKeyInfo format
        format: 'der',   // Distinguished Encoding Rules
      },
      privateKeyEncoding: {
        type: 'pkcs8',   // Private-Key Information Syntax Standard
        format: 'der',   // Distinguished Encoding Rules
      }
    });

    return {
      privateKey: keyPair.privateKey.toString('base64'),
      publicKey: keyPair.publicKey.toString('base64'),
    };
  } catch (error) {
    console.error('Failed to generate ECDSA key pair:', error);
    throw new Error(`ECDSA key generation failed: ${(error as Error).message}`);
  }
}

export function sign(privateKey: Buffer, input: string): string {
  try {
    const sign = createSign('sha256');
    sign.update(input);
    return sign.sign({
      key: privateKey,
      format: 'der',
      type: 'pkcs8'
    }, 'base64');
  } catch (error: unknown) {
    throw new Error(`Error signing payload: ${(error as Error).message}`);
  }
}

export function verify(publicKey: Buffer, input: string, signature: string): boolean {
  const verify = createVerify('sha256');
  verify.update(input);
  return verify.verify({
    key: publicKey,
    format: 'der',
    type: 'spki'
  }, signature, 'base64');
}
