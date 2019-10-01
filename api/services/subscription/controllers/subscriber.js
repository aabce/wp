'use strict';

const configs = require(`${__dirname}/../../../configs/config.json`);
const mongoose = require('mongoose');
const ms = require('ms');
const subscriberModel = mongoose.model('Subscriber');
const passwordMiddleware = require(`${__dirname}/../../../middleware/gen_password.js`);
const jwtMiddleware = require(`${__dirname}/../../../middleware/jwt.js`);
const sendPasswordMail = require(`${__dirname}/../../../middleware/send_password_email.js`);

const isArrayEmpty = array => array === undefined || array.length == 0 ? true : false;
const isObjectEmpty = object => object === null || !Object.keys(object).length ? true : false;
const addMonthToDate = (date, month) => new Date(date.setMonth(date.getMonth() + month))

module.exports.selectAllSubscribers = async (req, res) => {
  try {
    let subscribers = await subscriberModel.find({}, '-__v');
    isArrayEmpty(subscribers) ? res.status(404).send({ status: 'subscribers_not_found' }) : res.status(200).send(subscribers);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.selectSubscriberById = async (req, res) => {
  const subscriberPhone = req.params.subscriber_phone;

  try {
    let subscriber = await subscriberModel.findOne({ phone: subscriberPhone }, '-__v');
    if (isObjectEmpty(subscriber)) {
      res.status(404).send({ status: 'subscriber_not_found' });
    } else {
      res.status(200).send(subscriber);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.updateSubscriberById = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const subscriberPhone = req.params.subscriber_phone;
    const subscriberData = req.body;

    if (subscriberData.password === undefined && subscriberData.password !== subscriberData.confirm_password) {
      res.status(400).send({ status: 'passwords_not_match' });
      return 0;
    }

    const password = passwordMiddleware.genHashPassword(subscriberData.password);
    subscriberData.password = password.password;
    subscriberData.salt = password.salt;

    subscriberData.is_subscribed = false;

    const data = {
      $set: subscriberData
    };

    const options = {
      upsert: false,
      new: true,
      runValidators: true
    };

    try {
      let updatedSubscriber = await subscriberModel.findOneAndUpdate({ phone: subscriberPhone }, data, options);

      if (isObjectEmpty(updatedSubscriber)) {
        res.status(404).send({ status: 'subscriber_not_found' });
      } else {
        res.status(200).send({
          status: 'subscriber_was_updated',
          subscriber_id: updatedSubscriber._id
        });
      }
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        const pathRegex = err.message.match(/(?<=\bindex:\s)(\w+)/)
        const path = pathRegex ? pathRegex[1] : '';
        res.status(422).send({ status: 'key_already_exists', fields: path });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ status: 'fields_are_required', fields: Object.keys(err.errors)});
      } else {
        res.status(400).send({ status: err.message });
      }
    }
  }
};

module.exports.deleteSubscriberById = async (req, res) => {
  const subscriberPhone = req.params.subscriber_phone;

  try {
    let deletedSubscriber = await subscriberModel.findOneAndDelete({ phone: subscriberPhone });

    if (isObjectEmpty(deletedSubscriber)) {
      res.status(404).send({ status: 'subscriber_not_found' });
    } else {
      res.status(200).send({
        status: 'subscriber_was_deleted',
        subscriber_id: deletedSubscriber._id
      });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.getSubscription = async (req, res) => {
  const subscriberPhone = req.params.subscriber_phone;

  try {
    let subscriber = await subscriberModel.findOne({ phone: subscriberPhone }, 'is_subscribed subscription_date subscription_expires');
    if (isObjectEmpty(subscriber)) {
      res.status(404).send({ status: 'subscription_not_found' });
    } else {
      res.status(200).send(subscriber);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.paySubscription = async (req, res) => {
  const subscriberPhone = req.params.subscriber_phone;

  const currentDateString = Date();

  const currentDate = new Date(currentDateString);
  const newDate = addMonthToDate(new Date(currentDateString), 1);

  const data = {
    $set: {
      is_subscribed: true,
      subscription_date: currentDate,
      subscription_expires: newDate
    }
  };

  const options = {
    upsert: false,
    new: true,
    runValidators: true
  };

  let updatedSubscriber = await subscriberModel.findOneAndUpdate({ phone: subscriberPhone }, data, options);

  res.status(200).send({
    status: 'subscriber_was_updated'
  });
};




module.exports.signUp = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const subscriberPhone = req.params.subscriber_phone;
    const subscriberData = req.body;

    if (subscriberData.password === undefined && subscriberData.password !== subscriberData.confirm_password) {
      res.status(400).send({ status: 'passwords_not_match' });
      return 0;
    }

    const password = passwordMiddleware.genHashPassword(subscriberData.password);
    subscriberData.password = password.password;
    subscriberData.salt = password.salt;

    subscriberData.is_subscribed = false;
    subscriberData.is_unlimited = false;

    const data = {
      $set: subscriberData
    };

    const options = {
      upsert: true,
      new: true,
      runValidators: true
    };

    try {
      let updatedSubscriber = await subscriberModel.findOneAndUpdate({ phone: subscriberPhone }, data, options);

      if (isObjectEmpty(updatedSubscriber)) {
        res.status(404).send({ status: 'subscriber_not_found' });
      } else {
        res.status(200).send({
          status: 'subscriber_was_updated',
          subscriber_id: updatedSubscriber._id
        });
      }
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        const pathRegex = err.message.match(/(?<=\bindex:\s)(\w+)/)
        const path = pathRegex ? pathRegex[1] : '';
        res.status(422).send({ status: 'key_already_exists', fields: path });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ status: 'fields_are_required', fields: Object.keys(err.errors)});
      } else {
        res.status(400).send({ status: err.message });
      }
    }
  }
};

module.exports.signIn = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    let subscriber = await subscriberModel.findOne({ phone: req.body.phone }, 'phone password salt');

    if (isObjectEmpty(subscriber)) {
      res.status(401).send({ status: 'invalid_phone_or_password' });
    } else {
      try {
        const computedPassword = passwordMiddleware.getHashPassword(req.body.password, subscriber.salt);
        const subscriberPassword = subscriber.password;

        if (computedPassword === subscriberPassword) {
          const subscriberJwt = jwtMiddleware.createJWT({ _id: subscriber._id, phone: subscriber.phone });

          await subscriberModel.findByIdAndUpdate(subscriber._id, { token: subscriberJwt } );

          res.status(200).send({ msg: subscriberJwt });
        } else {
          res.status(401).send({ status: 'invalid_login_or_password' });
        }
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.signOut = async (req, res) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];

    const decodedToken = jwtMiddleware.decode(token);

    if (decodedToken !== null) {
      try {
        let subscriber = await subscriberModel.findOneAndUpdate({ _id: decodedToken._id }, { token: null });
        if (isObjectEmpty(subscriber)) {
          res.status(404).send({ status: 'subscriber_not_found' });
        } else {
          res.status(200).send({ status: 'subscriber_sing_out' });
        }
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    } else {
      res.status(400).send({ error: 'invalid_token' });
    }
  } else {
    res.status(400).send({ error: 'not_jwt_auth' });
  }
};

module.exports.changePassword = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const subscriberData = req.body;

    if (subscriberData.new_password !== subscriberData.confirm_password) {
      res.status(400).send({ status: 'passwords_not_match' });
      return 0;
    }

    let subscriber = await subscriberModel.findOne({ phone: subscriberData.phone });

    if (isObjectEmpty(subscriber)) {
      res.status(404).send({ status: 'subscriber_not_found' });
    } else {
      try {
        const oldPasswordData = passwordMiddleware.genHashPasswordWithSalt(subscriberData.old_password, subscriber.salt);

        if (oldPasswordData.password !== subscriber.password) {
          res.status(400).send({ status: 'passwords_not_match' });
          return 0;
        } else {
          const newPasswordData = passwordMiddleware.genHashPassword(subscriberData.new_password);
          await subscriberModel.findByIdAndUpdate(subscriber._id, { password: newPasswordData.password, salt: newPasswordData.salt } );

          res.status(200).send({ status: 'password_has_been_changed' });
        }
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.forgotPassword = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    let subscriber = await subscriberModel.findOne({ phone: req.body.phone }, '_id email');

    const randomCode = passwordMiddleware.getRandomCode(8);
    const expTime = Date.now() + 300000;

    if (isObjectEmpty(subscriber)) {
      res.status(404).send({ status: 'subscriber_not_found' });
    } else {
      try {
        await subscriberModel.findByIdAndUpdate(subscriber._id, { reset_password_code: randomCode, reset_password_expires: expTime } );

        sendPasswordMail.sendRestoreCode(subscriber.email, randomCode);

        res.status(200).send({ status: randomCode });
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.restorePassword = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    let subscriber = await subscriberModel.findOne({ phone: req.body.phone });

    if (isObjectEmpty(subscriber)) {
      res.status(404).send({ status: 'subscriber_not_found' });
    } else {
      if (subscriber.reset_password_code === req.body.code && subscriber.reset_password_expires > Date.now()) {
        try {
          const passwordData = passwordMiddleware.genHashPassword(req.body.password);
          await subscriberModel.findByIdAndUpdate(subscriber._id, { password: passwordData.password, salt: passwordData.salt, reset_password_code: null, reset_password_expires: null, token: null } );

          sendPasswordMail.sendRestoreMessage(subscriber.email);

          res.status(200).send({ status: 'password_has_been_changed' });
        } catch (err) {
          res.status(400).send({ error: err.message });
        }
      } else {
        res.status(400).send({ status: 'code_is_invalid_or_has_expired' });
      }
    }
  }
};
