import { SignJWT, jwtVerify } from 'jose';

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

export interface JWTPayload {
  sub: string;
  email: string;
}

export async function signAccessToken(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .setIssuedAt()
    .setSubject(payload.sub)
    .sign(accessSecret);
}

export async function signRefreshToken(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .setSubject(payload.sub)
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret);
  return payload as JWTPayload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret);
  return payload as JWTPayload;
}
