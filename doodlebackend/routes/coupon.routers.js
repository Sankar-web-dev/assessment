const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const authMiddleware = require("../middleware/auth.middleware");

// Public: guests validate coupons from the cart
router.post('/validate', couponController.previewCoupon);

router.use(authMiddleware);
router.use(authMiddleware.requireAdmin);

router.get('/', couponController.getCoupons);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
