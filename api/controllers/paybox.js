'use strict';
require('module-alias/register');
const configs = require(`@tella-configs/config.json`);
const mongoose = require('mongoose');
const userModel = mongoose.model('User');
const subscriptionModel = mongoose.model('Subscription');
const promocodeModel = mongoose.model('Promocode');
const passwordManager = require(`@tella-utills/gen_password.js`);
const jwtManager = require(`@tella-utills/jwt.js`);
const check = require(`@tella-utills/check.js`);
const sendMail = require(`@tella-utills/email_notify.js`);
const settingsController = require('@tella-controllers/settings.js');
const addMonthToDate = (date, month) => new Date(date.setMonth(date.getMonth() + month));

module.exports.resultGet = async (req, res) => {
  console.log(`RESPONSE FROM PAYBOX: ${JSON.stringify(req.body)}`);
  const subscriberId = req.tl_subsciber_id;
  const status = req.body.pg_status;
  const er_code = ('pg_error_code' in req.body) ? req.body.pg_error_code :null ;
  const er_descr = ('pg_error_description' in req.body) ? req.body.pg_error_description :null ;


  if ( status !== 'ok' ){
    res.status(400).send({
      error: 'payment_canceled',
      status: er_code,
      descr: er_descr
    });
    return 0;
  }else{

  }

  const currentDateString = Date();

  const currentDate = new Date(currentDateString);
  const newDate = addMonthToDate(new Date(currentDateString), 1);

  const data = {
      subscriber: true,
      subscription_starts: currentDate,
      subscription_ends: newDate
  };

  const options = {
    upsert: false,
    new: true,
    runValidators: true
  };

  let updatedSubscriber = await userModel.findOneAndUpdate({ _id: subscriberId }, { $set: data }, options);
  res.status(200).send({
    message: 'subscription_extended',
    subscription_starts: currentDate,
    subscription_ends: newDate
  });
};


