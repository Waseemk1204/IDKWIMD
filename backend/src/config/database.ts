import mongoose from 'mongoose';
import { config } from './index';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = config.NODE_ENV === 'test'
      ? config.MONGODB_TEST_URI
      : config.MONGODB_URI;

    const conn = await mongoose.connect(mongoURI, {
      // Best practice: Production-ready connection options
      serverSelectionTimeoutMS: 10000, // 10s to find a server
      socketTimeoutMS: 45000, // 45s for socket inactivity
      maxPoolSize: 10, // Connection pooling
      minPoolSize: 2,
      connectTimeoutMS: 30000, // 30s to establish connection
      retryWrites: true, // Auto-retry writes on network errors
      retryReads: true, // Auto-retry reads on network errors
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

export default connectDB;
