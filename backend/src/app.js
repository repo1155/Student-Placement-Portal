const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { config } = require('./config');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const savedRoutes = require('./routes/saved');
const practiceRoutes = require('./routes/practice');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.disable('x-powered-by');
if (config.isProduction) app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: config.clientOrigin.split(',').map((origin) => origin.trim()),
  credentials: true
}));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.get('/', (req, res) => {
  const websiteUrl = config.clientOrigin.split(',')[0].trim();
  res.redirect(302, websiteUrl);
});
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/practice', practiceRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
