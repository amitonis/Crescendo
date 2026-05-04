import helmet from 'helmet';
import { Express } from 'express';

/**
 * Configures security headers using Helmet.
 * Protects against common vulnerabilities:
 * - X-Frame-Options: Prevents clickjacking
 * - X-Content-Type-Options: Prevents MIME sniffing
 * - X-XSS-Protection: Legacy XSS protection
 * - Strict-Transport-Security: Forces HTTPS
 * - Content-Security-Policy: Prevents code injection
 */
export const setupSecurityHeaders = (app: Express): void => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.cloudinary.com'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          ...(process.env.NODE_ENV === 'production' && { upgradeInsecureRequests: [] }),
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    })
  );
};
