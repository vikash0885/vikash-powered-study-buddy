import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_study_buddy_secret_2024';

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, educationLevel } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await db.prepare(
            'INSERT INTO users (name, email, password, education_level) VALUES (?, ?, ?, ?)'
        ).run(name, email, hashedPassword, educationLevel || 'general');

        // Generate token
        const token = jwt.sign(
            { userId: result.lastInsertRowid, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: result.lastInsertRowid, name, email, educationLevel }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // Find user
        const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                educationLevel: user.education_level,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: `Server error during login: ${error.message}` });
    }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await db.prepare('SELECT id, name, email, education_level, avatar, created_at FROM users WHERE id = ?')
            .get(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            educationLevel: user.education_level,
            avatar: user.avatar,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, educationLevel, avatar } = req.body;
        const userId = req.userId;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const result = await db.prepare(
            'UPDATE users SET name = ?, education_level = ?, avatar = ? WHERE id = ?'
        ).run(name, educationLevel, avatar, userId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = await db.prepare('SELECT id, name, email, education_level, avatar FROM users WHERE id = ?').get(userId);

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                educationLevel: user.education_level,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error during profile update' });
    }
});

export default router;
