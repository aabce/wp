'use strict';

const mongoose = require('mongoose');
const subscriptionModel = mongoose.model('Subscription');
// const roundNumber = require(`${__dirname}/../../../middleware/round_number.js`);

const isArrayEmpty = array => array === undefined || array.length == 0 ? true : false;
const isObjectEmpty = object => object === null || !Object.keys(object).length ? true : false;



module.exports.selectAllSubscriptions = async (req, res) => {
  try {
    let subscriptions = await subscriptionModel.find({}, '-__v');
    isArrayEmpty(subscriptions) ? res.status(404).send({ status: 'subscriptions_not_found' }) : res.status(200).send(subscriptions);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.selectSubscriptionById = async (req, res) => {
  const subscriptionId = req.params.subscription_id;

  try {
    let subscription = await subscriptionModel.findById(subscriptionId, '-__v');

    if (isObjectEmpty(subscription)) {
      res.status(404).send({ status: 'subscription_not_found' });
    } else {
      res.status(200).send(subscription);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.createSubscription = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const subscriptionData = req.body;

    try {
      let createdSubscription = await subscriptionModel.create(subscriptionData);

      res.status(200).send({
        status: 'subscription_was_created',
        promo_code: createdSubscription._id
      });
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(422).send({ status: 'key_already_exists' });
      } else {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.updateSubscriptionById = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const subscriptionId = req.params.subscription_id;
    const subscriptionData = req.body;

    const options = {
      upsert: false,
      new: false,
      runValidators: true,
    };

    const data = {
      $set: subscriptionData
    };

    try {
      let updatedSubscription = await subscriptionModel.findByIdAndUpdate(subscriptionId, data, options);

      if (isObjectEmpty(updatedSubscription)) {
        res.status(404).send({ status: 'subscription_not_found' });
      } else {
        res.status(200).send({
          status: 'subscription_was_updated',
          promo_code: updatedSubscription._id
        });
      }
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
};

module.exports.deleteSubscriptionById = async (req, res) => {
  const subscriptionId = req.params.subscription_id;

  try {
    let deletedSubscription = await subscriptionModel.findByIdAndDelete(subscriptionId);

    if (isObjectEmpty(deletedSubscription)) {
      res.status(404).send({ status: 'subscription_not_found' });
    } else {
      res.status(200).send({
        status: 'promocode_was_deleted',
        promo_code: deletedSubscription._id
      });
    }
  } catch (err) {
    res.status(400).send({ error: err });
  }
};
