import { Request, Response } from 'express';
import { User } from '../models';
import { isValidEmail, isStrongPassword } from '../utils/validation';

/**
 * @route POST /api/auth/register
 * @desc Handles new user registration
 * @access Public
 */

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    // --- 1. Basic Input Validation ---
    if (!username || !email || !password) {
        res.status(400).json({ message: 'Please enter all required fields: username, email, and password.' });
        return;
    }

    if (!isValidEmail(email)) {
        res.status(400).json({ message: 'Invalid email format.' });
        return;
    }

    if (!isStrongPassword(password)) {
        res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        return;
    }

    try {
        // --- 2. Create the User Document ---
        // We temporarily pass the plaintext password into the 'passwordHash' field.
        // The pre-save hook in user.model.ts will automatically hash this before it hits the database.
        const newUser = new User({
            username,
            email,
            // The magic happens here: Mongoose pre-save hook hashes this password!
            passwordHash: password,
            // role defaults to 'standard'
        });

        // --- 3. Save the User ---
        const savedUser = await newUser.save();

        // --- 4. Respond with success (and strip sensitive data) ---
        // We only send back public user data to the client
        res.status(201).json({
            message: 'User registered successfully. Proceed to login.',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
                createdAt: savedUser.createdAt,
            },
        });

    } catch (error) {
        // --- 5. Error Handling ---

        // Handle duplicate key error (for unique index violation on email/username)
        if ((error as any).code === 11000) {
            const field = Object.keys((error as any).keyPattern)[0];
            res.status(409).json({ message: `The ${field} is already registered.`, field });
            return;
        }

        // Handle Mongoose validation errors
        if ((error as any).name === 'ValidationError') {
            const messages = Object.values((error as any).errors).map((err: any) => err.message);
            res.status(400).json({ message: 'Validation failed.', errors: messages });
            return;
        }

        // Catch all other server errors
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};
