import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    console.error('❌ MONGODB_URI is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongodbUri);
    console.log('✅ MongoDB connected successfully');

    // Set up connection event listeners for production stability
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

export default connectDB;

