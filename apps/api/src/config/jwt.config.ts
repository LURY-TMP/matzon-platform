import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem',
  publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
}));
