const express = require('express');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Rounds
 *   description: Inspection rounds
 */
const inspectionRoundCtrl = require('../controllers/inspectionRoundController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const rules = require('../middlewares/validationRules');

router.post(
  '/',
  auth.check,
  validate(rules.roundCreateRules),
  inspectionRoundCtrl.create
);
/**
 * @swagger
 * /api/rounds:
 *   post:
 *     summary: Create inspection round
 *     tags: [Rounds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               managerId:
 *                 type: string
 *               location:
 *                 type: string
 *               day:
 *                 type: string
 *     responses:
 *       201:
 *         description: Round created
 */
router.get('/', auth.check, inspectionRoundCtrl.list);

/**
 * @swagger
 * /api/rounds:
 *   get:
 *     summary: List inspection rounds
 *     tags: [Rounds]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rounds
 */
router.get('/:id', auth.check, inspectionRoundCtrl.getById);
/**
 * @swagger
 * /api/rounds/{id}:
 *   get:
 *     summary: Get round by ID
 *     tags: [Rounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Round data
 *       404:
 *         description: Not found
 */
module.exports = router;