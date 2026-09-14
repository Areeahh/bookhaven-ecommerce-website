const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// CLIENT_ORIGIN can hold multiple allowed URLs separated by commas,
// e.g. "http://localhost:5173,https://your-app.vercel.app"
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    // Allow explicitly listed origins (e.g. localhost, your main Vercel domain)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow ANY Vercel deployment URL belonging to this project —
    // covers the random preview URLs Vercel generates on every `vercel --prod`
    // (e.g. bookhaven-e-commerce-xxxxx-areeha1.vercel.app)
    if (/^https:\/\/bookhaven-e-commerce[a-z0-9-]*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler (catches anything thrown/unhandled)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;