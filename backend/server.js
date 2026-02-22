require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const perfumeRoutes = require('./routes/perfumeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();

// Trust proxy (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB().then(async () => {
  // One-time: mark ALL existing users as verified (they registered before verification was added)
  try {
    const User = require('./models/User');
    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Auto-verified ${result.modifiedCount} existing user(s)`);
    }
  } catch (err) {
    console.error('Migration error:', err.message);
  }
});

// Security middleware
app.use(helmet());

// CORS – allow multiple origins (dev + production)
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (mobile apps, curl, health-checks)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Compression
app.use(compression());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/perfumes', perfumeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api', recommendationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', version: 'v2-fireandforget', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

module.exports = app;
