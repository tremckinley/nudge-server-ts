import connectDB from './config/db';
import { app } from './config/db';
import express, { Request, Response } from 'express';
import authRoutes from './routes/auth.routes';



app.use(express.json());

// Use auth routes
app.use('/api/auth', authRoutes);

// Basic GET request
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Nudge Server API' });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});




connectDB();
