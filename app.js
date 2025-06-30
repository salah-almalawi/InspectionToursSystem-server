const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('./utils/logger');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('./config/db');


const authRouter = require('./routes/auth');
const managerRouter = require('./routes/managers');
const inspectionRoundRouter = require('./routes/inspectionRounds');

const app = express();

// Security middleware: Helmet, CORS, and rate limiting
const allowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS;
const corsOptions = allowedOriginsEnv ? { origin: allowedOriginsEnv.split(',').map(o => o.trim()) } : {};

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,                       // default 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(cors());
app.use(limiter);

// Request logging using Winston (single entry on finish)
app.use((req, res, next) => {
  res.on('finish', () => {
    winston.info(`${req.method} ${req.originalUrl} ${req.ip} ${res.statusCode}`);
  });
  next();
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/managers', managerRouter);
app.use('/api/rounds', inspectionRoundRouter);


module.exports = app;

