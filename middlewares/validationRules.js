const { body } = require('express-validator');

exports.registerRules = [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('كلمة المرور يجب ألا تقل عن 6 أحرف'),
];

exports.loginRules = [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
];

exports.managerCreateRules = [
    body('name').notEmpty().withMessage('الاسم مطلوب'),
    body('rank').notEmpty().withMessage('الرتبة مطلوبة'),,
    body('department').notEmpty().withMessage('القسم مطلوب'),
];

exports.managerUpdateRules = [
    body('name').optional().notEmpty().withMessage('الاسم مطلوب'),
    body('rank').optional().notEmpty().withMessage('الرتبة مطلوبة'),,
    body('department').optional().notEmpty().withMessage('القسم مطلوب'),
];

exports.roundCreateRules = [
    body('managerId').notEmpty().withMessage('معرّف المدير مطلوب'),
    body('location').notEmpty().withMessage('الموقع مطلوب'),
    body('day').notEmpty().withMessage('اليوم مطلوب'),
];