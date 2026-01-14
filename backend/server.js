import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/database.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import studyPlanRoutes from './routes/studyplan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory (.env in root)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/studyplan', studyPlanRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Study Buddy API is running' });
});

// DB Status check (for debugging deployment)
app.get('/api/db-status', (req, res) => {
    try {
        const result = db.prepare('SELECT count(*) as count FROM users').get();
        res.json({ status: 'ok', database: 'connected', userCount: result.count });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

import fs from 'fs';
import path from 'path';

// Debug endpoint to list files (Temporary)
app.get('/api/debug-files', (req, res) => {
    try {
        const listFiles = (dir, fileList = []) => {
            if (!fs.existsSync(dir)) return fileList;
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    if (file !== 'node_modules' && file !== '.git') {
                        fileList.push({ name: file, type: 'dir', path: filePath });
                        listFiles(filePath, fileList);
                    }
                } else {
                    fileList.push({ name: file, type: 'file', path: filePath });
                }
            });
            return fileList;
        };

        const rootDir = process.cwd();
        const files = listFiles(rootDir);
        res.json({ root: rootDir, files: files.map(f => f.path.replace(rootDir, '')) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: String(err.message || 'Something went wrong!') });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Study Buddy Backend running on port ${PORT}`);
    console.log(`📚 API URL: http://localhost:${PORT}/api`);
});
