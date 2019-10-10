'use strict';

const express = require('express');
const router = express.Router();

const subscriptionController = require(`${__dirname}/../controllers/subscription.js`);

router.get('/subscription/subscription/get_subscriptions', subscriptionController.selectAllSubscriptions);
router.get('/subscription/subscription/get_subscription/:subscription_id', subscriptionController.selectSubscriptionById);
router.post('/subscription/subscription/create_subscription', subscriptionController.createSubscription);
router.put('/subscription/subscription/update_subscription/:subscription_id', subscriptionController.updateSubscriptionById);
router.delete('/subscription/subscription/delete_subscription/:subscription_id', subscriptionController.deleteSubscriptionById);

module.exports = router;
