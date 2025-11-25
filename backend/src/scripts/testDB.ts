import mongoose from 'mongoose';
import { config } from '../config';

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...', config.MONGODB_URI);
        await mongoose.connect(config.MONGODB_URI);
        console.log('MongoDB Connected');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

connectDB();
