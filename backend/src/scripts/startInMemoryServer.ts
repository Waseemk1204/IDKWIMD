import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '../config';

// Import server (but don't start it yet if it auto-starts, wait, server.ts auto-starts at the end!)
// We need to prevent server.ts from auto-starting or handle it.
// server.ts has: const server = new Server(); server.start();
// This means importing it will start it.
// But we want to set the URI BEFORE it connects.

// Strategy:
// 1. Start MongoMemoryServer
// 2. Update config.MONGODB_URI
// 3. Import server (which will connect using the updated config)

async function start() {
    try {
        console.log('Starting MongoMemoryServer...');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        console.log('MongoMemoryServer started at:', uri);

        // Update config
        // We need to modify the exported config object. 
        // Since it's a const export, we might need to rely on process.env if config reads it at runtime?
        // No, config reads process.env at module load time.
        // But we can assign to config properties if they are not readonly?
        // config properties are not readonly in the interface usually, but the object is const.
        // However, the properties are writable.

        // Force update the config
        (config as any).MONGODB_URI = uri;
        (config as any).PORT = 5002; // Use a different port to avoid conflicts

        console.log('Updated config with in-memory URI');

        // Now import server. 
        // Note: Since server.ts starts on import, it will use the config we just modified?
        // Yes, because config is imported by server -> connectDB -> config.
        // And since we already imported config here, it's the same instance.

        // However, we need to make sure server.ts doesn't crash if we import it.
        // server.ts: const server = new Server(); server.start();

        require('../server');

        console.log('Server started with in-memory DB on port 5002');

    } catch (error) {
        console.error('Failed to start in-memory server:', error);
        process.exit(1);
    }
}

start();
