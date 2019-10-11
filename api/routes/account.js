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
router.post('/subscriber/create', jwt.verifyJWT, perms.admin(true), accountsController.createSubscriber);
router.delete('/subscriber/:id', jwt.verifyJWT, perms.admin(true), accountsController.deleteSubscriberById);
router.get('/subscriber', jwt.verifyJWT, perms.admin(true), accountsController.selectAllSubscribers);

// admin user
router.get('/subscriber', jwt.verifyJWT, perms.adminOrSelf() , accountsController.selectSubscriberById);
router.post('/subscriber/change', jwt.verifyJWT, perms.adminOrSelf(), accountsController.changePassword);
router.put('/subscriber/:id', jwt.verifyJWT, perms.adminOrSelf(), accountsController.updateSubscriberById);
router.get('/subscriber/subscription', jwt.verifyJWT, perms.adminOrSelf(), accountsController.getSubscriptionById);
router.post('/subscriber/payment', jwt.verifyJWT, accountsController.computePayment);
// extendSubscription 
router.post('/subscriber/subscription', jwt.verifyJWT, perms.adminOrSelf(), accountsController.extendSubscription);




module.exports = router;
