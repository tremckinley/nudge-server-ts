import connectDB from './config/db';
import { app } from './config/db';
import express, { Request, Response } from 'express';
import { registerUser } from './auth/controller';


app.use(express.json());

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

app.post('/register', registerUser);




connectDB();
