const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require("../middleware/auth.middleware")
const { requireAdmin } = require("../middleware/auth.middleware")

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);
router.get('/users', authMiddleware, requireAdmin, userController.getUsers);
router.patch('/users/:id/status', authMiddleware, requireAdmin, userController.updateUserStatus);

module.exports = router;