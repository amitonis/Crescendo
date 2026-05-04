/**
 * Validates that all required environment variables are configured.
 * Run this at server startup to catch configuration issues early.
 */
export const validateEnvironment = (): void => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'CLIENT_URL',
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach((envVar) => console.error(`   - ${envVar}`));
    process.exit(1);
  }

  console.log('✅ All required environment variables are configured');
};
