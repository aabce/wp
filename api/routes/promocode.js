'use strict';
require('module-alias/register');
const express = require('express');
const jwt = require('@tella-middlewares/jwt');
const perms = require('@tella-middlewares/perms');
const router = express.Router();
const promocodeController = require(`@tella-controllers/promocode.js`);

router.get('/promocode', promocodeController.getAll);
router.get('/promocode/:id', promocodeController.getById);

// router.post('/promocode', jwt.verifyJWT, perms.admin(true), promocodeController.createPromocode); // prod
router.post('/promocode', jwt.verifyJWT, promocodeController.createPromocode); // test
router.put('/promocode/:id', jwt.verifyJWT, perms.admin(true), promocodeController.update);
router.delete('/promocode/:id', jwt.verifyJWT, perms.admin(true), promocodeController.delete);

// router.get('/promo_code/get_promo_codes', promoCodeController.selectAllPromocodes);
// router.get('/promo_code/get_promo_code/:promo_code', promoCodeController.selectPromocodeByName);
// router.get('/promo_code/get_discount_price/:price/:promo_code', promoCodeController.getPriceWithDiscount);

module.exports = router;
