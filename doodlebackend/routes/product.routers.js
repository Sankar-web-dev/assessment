const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require("../middleware/auth.middleware");

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/related', productController.getRelatedProducts);
router.post('/', authMiddleware, authMiddleware.requireAdmin, productController.createProduct);
router.put('/:id', authMiddleware, authMiddleware.requireAdmin, productController.updateProduct);
router.delete('/:id', authMiddleware, authMiddleware.requireAdmin, productController.deleteProduct);

module.exports = router;
