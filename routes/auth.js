const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
const authCtrl = require('../controllers/authController');
const validate = require('../middlewares/validate');
const rules = require('../middlewares/validationRules');
const auth = require('../middlewares/auth');

router.post('/register', auth.check, validate(rules.registerRules), authCtrl.register);
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */

// تسجيل الدخول
router.post('/login', validate(rules.loginRules), authCtrl.login);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and retrieve a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token returned
 */

// تسجيل الخروج
router.post('/logout', authCtrl.logout);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Success message
 */

module.exports = router;