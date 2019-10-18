'use strict';
require('module-alias/register');

const express = require('express');
const router = express.Router();
const jwt = require('@tella-middlewares/jwt');
const perms = require('@tella-middlewares/perms');
const accountsController = require(`@tella-controllers/account.js`);

// free
router.post('/subscriber/sign_up', accountsController.signup); // Create a new Customer Account.
router.post('/subscriber/sign_in', accountsController.signin); // Enter in the System.
router.post('/subscriber/forgot', accountsController.forgotPassword);
router.post('/subscriber/restore', accountsController.restorePassword);
router.post('/subscriber/reset', accountsController.resetPassword);

// admin
router.post('/subscriber/create', jwt.verifyJWT, perms.admin(true), accountsController.create);
router.delete('/subscriber/:id', jwt.verifyJWT, perms.admin(true), accountsController.delete);
router.get('/subscriber', jwt.verifyJWT, perms.admin(true), accountsController.getAll);

// admin user
router.get('/subscriber/:id', jwt.verifyJWT, perms.adminOrSelf() , accountsController.get);
router.post('/subscriber/change', jwt.verifyJWT, perms.adminOrSelf(), accountsController.changePassword);
router.put('/subscriber/:id', jwt.verifyJWT, perms.adminOrSelf(), accountsController.update);
router.get('/subscriber/subscription', jwt.verifyJWT, perms.adminOrSelf(), accountsController.getSubscriptionById);

router.post('/subscriber/payment', jwt.verifyJWT, accountsController.computePayment);

// test
// router.get('/test/payment', accountsController.testPayment);



module.exports = router;
