'use strict';
require('module-alias/register');

const express = require('express');
const router = express.Router();
const jwt = require('@tella-middlewares/jwt');
const perms = require('@tella-middlewares/perms');
const settingsController = require(`@tella-controllers/settings.js`);


// admin
router.get('/settings', jwt.verifyJWT, perms.admin(true), settingsController.getSettings);
router.post('/settings', jwt.verifyJWT, perms.admin(true), settingsController.updateSettings);




module.exports = router;
