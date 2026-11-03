const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require("../middleware/auth.middleware");

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authMiddleware, authMiddleware.requireAdmin, categoryController.createCategory);
router.put('/:id', authMiddleware, authMiddleware.requireAdmin, categoryController.updateCategory);
router.delete('/:id', authMiddleware, authMiddleware.requireAdmin, categoryController.deleteCategory);

module.exports = router;
