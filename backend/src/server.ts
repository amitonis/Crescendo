import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';

import connectDB from './config/db';
import { errorHandler } from './middleware/errorMiddleware';
import { createLogger } from './middleware/loggingMiddleware';
import { apiLimiter, authLimiter } from './middleware/rateLimitMiddleware';
import { setupSecurityHeaders } from './middleware/securityMiddleware';
import { inputValidationMiddleware } from './middleware/inputValidationMiddleware';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import trackRoutes from './routes/trackRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { validateEnvironment } from './utils/envValidation';

dotenv.config();

// Validate environment variables at startup
validateEnvironment();

const app = express();
const port = process.env.PORT || 5000;

// Request logging
app.use(createLogger());

// Security headers
setupSecurityHeaders(app);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(cookieParser());

// Input validation
app.use(inputValidationMiddleware);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔒 Security headers enabled`);
      console.log(`⚡ Rate limiting active`);
    });
  } catch (error: unknown) {
    console.error('❌ Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;


