'use strict';
require('module-alias/register');

const express = require('express');
const router = express.Router();
const payboxController = require(`@tella-controllers/paybox.js`);

// free
router.get('/paybox/result', payboxController.resultGet);
router.post('/paybox/result', payboxController.resultPost);


module.exports = router;
