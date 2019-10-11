'use strict';
require('module-alias/register');
const mongoose = require('mongoose');
const subscriptionModel = mongoose.model('Subscription');
const check = require(`@tella-utills/check.js`);


module.exports.get = async (req, res) => {
    // console.log(JSON.stringify(subscriptionData));
    try {
      let subscription = await subscriptionModel.find().limit(1);

      if (check.isObjectEmpty(subscription)) {
        res.status(404).send({ error: 'subscription_not_found' });
      } else {
        res.status(200).send({
          message: 'subscription_was_updated',
          subscription: subscription[0]
        });
      }
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        const pathRegex = err.message.match(/(?<=\bindex:\s)(\w+)/)
        const path = pathRegex ? pathRegex[1] : '';
        res.status(422).send({ status: 'key_already_exists', fields: path.replace(/_|1/g,'') });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ error: 'fields_are_required', fields: Object.keys(err.errors)});
      } else {
        res.status(400).send({ error: err.message });
      }
    }
}

module.exports.create = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    const subscriptionData = req.body;
    const data = {
      $set: subscriptionData
    };
    
    const options = {
      upsert: true,
      new: true,
      runValidators: true
    };
    
    try {
      
        let subscription = await subscriptionModel.find();
        let subscription_id = ( subscription[0] ) ? subscription[0]._id : undefined ;
        let updatedsubscription = null;
        if (subscription_id){
          updatedsubscription = await subscriptionModel.findOneAndUpdate({ _id : subscription_id}, data, options);
        }else{
          updatedsubscription = await subscriptionModel.create(subscriptionData);
        }

      if (check.isObjectEmpty(updatedsubscription)) {
        res.status(404).send({ error: 'subscription_not_found' });
      } else {
        res.status(200).send({
          message: 'subscription_was_updated',
          subscription_id: updatedsubscription._id
        });
      }
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        const pathRegex = err.message.match(/(?<=\bindex:\s)(\w+)/)
        const path = pathRegex ? pathRegex[1] : '';
        res.status(422).send({ status: 'key_already_exists', fields: path.replace(/_|1/g,'') });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ error: 'fields_are_required', fields: Object.keys(err.errors)});
      } else {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

