// Checks a Firebase Authentication ID token (Google or email/password sign-in) without the Firebase SDK: an RS256 JWT
// signed by Google's securetoken keys, issued for this Firebase project.
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

// -> { uid, email, emailVerified, name } or null
export async function verifyFirebase(token, projectId) {
  if (!token || !projectId) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${projectId}`, audience: projectId, algorithms: ['RS256'] });
    if (!payload.sub) return null;
    return { uid: payload.sub, email: String(payload.email || '').toLowerCase(), emailVerified: payload.email_verified === true, name: String(payload.name || '') };
  } catch {
    return null;
  }
}
