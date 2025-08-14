import { cookies } from 'next/headers';
import { verifyAccessToken, JWTPayload } from '@/lib/jwt';

export async function getUser(): Promise<JWTPayload> {
  const token = cookies().get('access_token')?.value;
  if (!token) {
    throw new Error('Unauthorized');
  }
  try {
    return await verifyAccessToken(token);
  } catch {
    throw new Error('Unauthorized');
  }
}
