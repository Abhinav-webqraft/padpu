import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

/**
 * Verifies a Google ID token securely.
 * Checks signature, expiration, issuer, audience, and email verification status.
 * Never logs complete ID tokens.
 *
 * @param {string} idToken - Google ID token
 * @returns {Promise<{ sub: string, email: string, emailVerified: boolean, name: string, picture: string }>}
 */
export async function verifyGoogleToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('ID token is required');
  }

  // Support mocked token verification for automated tests only when NODE_ENV === 'test'
  if (process.env.NODE_ENV === 'test' && idToken.startsWith('mock-google-token:')) {
    const raw = idToken.replace('mock-google-token:', '');
    const data = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    if (data.expired) {
      const err = new Error('Token used too late');
      err.code = 'ERR_TOKEN_EXPIRED';
      throw err;
    }
    if (data.invalidSignature) {
      const err = new Error('Invalid token signature');
      err.code = 'ERR_INVALID_SIGNATURE';
      throw err;
    }
    return {
      sub: data.sub,
      email: data.email,
      emailVerified: Boolean(data.email_verified),
      name: data.name || '',
      picture: data.picture || ''
    };
  }

  const effectiveClientId = process.env.GOOGLE_CLIENT_ID;
  if (!effectiveClientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in server environment');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: effectiveClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    // Verify issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      throw new Error('Invalid token issuer');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: Boolean(payload.email_verified),
      name: payload.name || '',
      picture: payload.picture || ''
    };
  } catch (error) {
    // Log security-relevant error without logging complete token
    const tokenHint = idToken.length > 10 ? `${idToken.substring(0, 5)}...${idToken.substring(idToken.length - 5)}` : '***';
    console.warn(`[Security] Google token verification failed (hint: ${tokenHint}): ${error.message}`);
    throw error;
  }
}
