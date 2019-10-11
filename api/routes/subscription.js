'use strict';
require('module-alias/register');
const express = require('express');
const router = express.Router();
const jwt = require('@tella-middlewares/jwt');
const perms = require('@tella-middlewares/perms');
const subscriptionController = require(`@tella-controllers/subscription.js`);

router.get('/subscription/', subscriptionController.get);

// admin
router.post('/subscription', jwt.verifyJWT, perms.admin(true), subscriptionController.create);

module.exports = router;
