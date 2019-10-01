'use strict';

const express = require('express');
const router = express.Router();

const subscriberController = require(`${__dirname}/../controllers/subscriber.js`);

router.get('/subscription/subscriber/get_subscribers', subscriberController.selectAllSubscribers);
router.get('/subscription/subscriber/get_subscriber/:subscriber_phone', subscriberController.selectSubscriberById);
router.put('/subscription/subscriber/update_subscriber/:subscriber_phone', subscriberController.updateSubscriberById);
router.delete('/subscription/subscriber/delete_subscriber/:subscriber_phone', subscriberController.deleteSubscriberById);

router.get('/subscription/subscriber/pay_subscription/:subscriber_phone', subscriberController.paySubscription);
router.get('/subscription/subscriber/get_subscription/:subscriber_phone', subscriberController.getSubscription);

router.post('/subscription/subscriber/sign_up', subscriberController.signUp); // Create a new Customer Account.
router.post('/subscription/subscriber/sign_in', subscriberController.signIn); // Enter in the System.
router.get('/subscription/subscriber/sign_out', subscriberController.signOut); // Exit from the System.
router.post('/subscription/subscriber/change', subscriberController.changePassword);
router.post('/subscription/subscriber/forgot', subscriberController.forgotPassword);
router.post('/subscription/subscriber/restore', subscriberController.restorePassword);

module.exports = router;
