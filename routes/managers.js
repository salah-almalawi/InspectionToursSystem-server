

const express = require('express');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Managers
 *   description: Manager management
 */
const managerCtrl = require('../controllers/managerController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const rules = require('../middlewares/validationRules');

router.post('/',  validate(rules.managerCreateRules), managerCtrl.create);

/**
 * @swagger
 * /api/managers:
 *   post:
 *     summary: Create a manager
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rank:
 *                 type: integer
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Manager created
 */
// router.get('/', auth.check, managerCtrl.list);
router.get('/', managerCtrl.list);
/**
 * @swagger
 * /api/managers:
 *   get:
 *     summary: List managers
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of managers
 */
router.get('/:id/summary', managerCtrl.summary);

/**
 * @swagger
 * /api/managers/{id}/summary:
 *   get:
 *     summary: Get manager and all rounds
 *     tags: [Managers]
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
 *         description: Manager and rounds
 */
router.get('/:id', managerCtrl.getById);
/**
 * @swagger
 * /api/managers/{id}:
 *   get:
 *     summary: Get manager by ID
 *     tags: [Managers]
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
 *         description: Manager data
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  auth.check,
  validate(rules.managerUpdateRules),
  managerCtrl.update
);
/**
 * @swagger
 * /api/managers/{id}:
 *   put:
 *     summary: Update manager
 *     tags: [Managers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rank:
 *                 type: integer
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.delete('/:id',managerCtrl.remove);
/**
 * @swagger
 * /api/managers/{id}:
 *   delete:
 *     summary: Delete manager
 *     tags: [Managers]
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
 *         description: Deleted
 */
module.exports = router;