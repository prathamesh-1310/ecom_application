/**
 * Centralized Server Error Response Helper
 * Logs full debug details (stack traces, SQL errors, file paths) on the server console,
 * but returns ONLY a clean, user-friendly message to clients (no internal paths, SQL details, or env vars).
 */
export const handleServerError = (res, error, friendlyMessage = 'An unexpected internal server error occurred', statusCode = 500) => {
  // 1. Log full error details securely on the server console
  console.error(`[SERVER ERROR] ${new Date().toISOString()} - ${friendlyMessage}:`);
  if (error && error.stack) {
    console.error(error.stack);
  } else {
    console.error(error);
  }

  // 2. Check production environment mode
  const isProduction = process.env.NODE_ENV === 'production';

  // 3. Return clean, user-facing response with zero internal leakages
  return res.status(statusCode).json({
    success: false,
    message: friendlyMessage,
    // Debug mode disabled in production: Omit raw stack trace, SQL errors, paths, and env vars
    ...(!isProduction && process.env.DEBUG === 'true' ? { debugNotice: 'Check server terminal logs for details.' } : {}),
  });
};
