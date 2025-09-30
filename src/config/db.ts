import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

export const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow your frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Middleware to parse JSON bodies

// --- WHY: Centralized connection is efficient. ---
// Mongoose creates a connection pool, which is much faster than opening a new connection for every request.
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error("MONGO_URI is not defined in environment variables. Cannot connect to MongoDB.");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB successfully connected!");

        // Start the Express server only after a successful DB connection
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            // TODO: Initialize routes here (e.g., app.use('/api/users', userRoutes);)
        });

    } catch (err) {
        console.error("MongoDB connection failed:", err);
        // Exit process on failure
        process.exit(1); 
    }
};

export default connectDB;