import dotenv from 'dotenv';
dotenv.config();

/**
 * Retrieves the JWT secret key from environment variables.
 * Enforces requirement in production and provides a centralized fallback for local development.
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing!');
    }
    return 'dev_fallback_jwt_secret_key_change_in_env';
  }
  return secret;
};

export const JWT_SECRET = getJwtSecret();
