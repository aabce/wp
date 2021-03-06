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

module.exports.signup = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    const subscriberID = req.params.id;
    const subscriberData = req.body;

    
    if (subscriberData.password === undefined) {
        res.status(400).send({ error: 'password_not_provided' });
        return
      }
      
      
      // console.log(JSON.stringify(subscriberData));
      const password = passwordManager.genHashPassword(subscriberData.password);
    subscriberData.password = password.password;
    subscriberData.salt = password.salt;
    
    subscriberData.subscriber = false;
    subscriberData.is_admin = false;
    
    
    const data = {
      $set: subscriberData
    };

    const options = {
      upsert: true,
      new: true,
      runValidators: true
    };

    try {
      let updatedSubscriber = await userModel.findOneAndUpdate({ _id : mongoose.Types.ObjectId(subscriberID)}, data, options);

      if (check.isObjectEmpty(updatedSubscriber)) {
        res.status(404).send({ error: 'subscriber_not_found' });
      } else {
        res.status(200).send({
          message: 'subscriber_was_updated',
          subscriber_id: updatedSubscriber._id
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

module.exports.signin = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    let subscriber = await userModel.findOne({ email: req.body.email }, '_id email password salt');
    // console.log(JSON.stringify(subscriber));
    if (check.isObjectEmpty(subscriber)) {
      res.status(400).send({ error: 'invalid_email_or_password' });
    } else {
      try {
        const computedPassword = passwordManager.getHashPassword(req.body.password, subscriber.salt);
        const subscriberPassword = subscriber.password;

        if (computedPassword === subscriberPassword) {
          const subscriberJwt = jwtManager.createJWT({ _id: subscriber._id, email: subscriber.email });
          // console.log(`TOKE1=${ JSON.stringify( subscriberJwt ) }`);
          await userModel.findByIdAndUpdate(subscriber._id, { token: subscriberJwt } );
          let updated_sub = await userModel.findOne({ _id: subscriber._id }).select('-password -salt -token');
          res.status(200).send({user: updated_sub, token:subscriberJwt});
        } else {
          res.status(400).send({ error: 'invalid_email_or_password' });
        }
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.forgotPassword = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    let subscriber = await userModel.findOne({ email: req.body.email }, '_id email');

    const randomCode = passwordManager.getRandomCode(8);
    const expTime = Date.now() + 300000;

    if (check.isObjectEmpty(subscriber)) {
      res.status(404).send({ error: 'subscriber_not_found' });
    } else {
      try {
        await userModel.findByIdAndUpdate(subscriber._id, { reset_code: randomCode, reset_exp: expTime } );

        // console.log(`USER==${ subscriber }`);

        let status = sendMail.sendRestoreCode(subscriber.email, randomCode);
        if (status){
          res.status(200).send({ message: 'code_sent', id: subscriber._id });
        }else{
          res.status(500).send({ error: 'invalid_settings' });
        }
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.restorePassword = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    let subscriber = await userModel.findOne({ reset_code: req.body.code });

    if (check.isObjectEmpty(subscriber)) {
      res.status(400).send({ error: 'invalid_code' });
    } else {
      if (subscriber.reset_exp > Date.now()) {
        try {
          const reset_token = passwordManager.getRandomCode(20);
          await userModel.findByIdAndUpdate(subscriber._id, { reset_token: reset_token } );
          res.status(200).send({ reset_token: reset_token });
        } catch (err) {
          res.status(400).send({ error: err.message });
        }
      } else {
        res.status(400).send({ status: 'code_is_invalid_or_has_expired' });
      }
    }
  }
};

module.exports.resetPassword = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    const subscriberData = req.body;

    // console.log(JSON.stringify(!subscriberData.reset_token && !subscriberData.password));
    if (!(subscriberData.reset_token && subscriberData.password)) {
      res.status(400).send({ error: 'invalid_payload' });
      return 0;
    }

    let subscriber = await userModel.findOne({ reset_token: subscriberData.reset_token });

    // if (subscriber.reset_exp < Date.now()) {
    //   res.status(400).send({ error: 'invalid_token' });
    //   return 0;
    // }


    if (check.isObjectEmpty(subscriber)) {
      res.status(400).send({ error: 'invalid_token' });
    } else {
      try {
          const newPasswordData = passwordManager.genHashPassword(subscriberData.password);
          await userModel.findByIdAndUpdate(subscriber._id, { password: newPasswordData.password, salt: newPasswordData.salt } );

          let status = sendMail.sendRestoreMessage(subscriber.email);
          if (status){
            res.status(200).send({ message: 'password_has_been_changed' });
          }else{
            res.status(500).send({ error: 'invalid_settings' });
          }

      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.changePassword = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    const subscriberData = req.body;

    
    if (!subscriberData.new_password) {
      res.status(400).send({ error: 'passwords_not_match' });
      return 0;
    }

    let subscriber = await userModel.findOne({ _id: req.decoded._id });

    if (check.isObjectEmpty(subscriber)) {
      res.status(404).send({ error: 'subscriber_not_found' });
    } else {
      try {
        const oldPasswordData = passwordManager.genHashPasswordWithSalt(subscriberData.old_password, subscriber.salt);
      
        if (oldPasswordData.password !== subscriber.password) {
          res.status(400).send({ error: 'passwords_not_match' });
          return 0;
        } else {
          const newPasswordData = passwordManager.genHashPassword(subscriberData.new_password);
          let token = jwtManager.createJWT({ _id: subscriber._id, email: subscriber.email });
          await userModel.findByIdAndUpdate(subscriber._id, { password: newPasswordData.password, salt: newPasswordData.salt, token:token } );
          sendMail.sendRestoreMessage(subscriber.email);
          res.status(200).send({ message: 'password_has_been_changed', token:token });
        }
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.delete = async (req, res) => {
  const subscriber_id = req.params.id;
  

  try {
    let deletedSubscriber = await userModel.findOneAndDelete({ _id: subscriber_id });

    if (check.isObjectEmpty(deletedSubscriber)) {
      res.status(404).send({ error: 'subscriber_not_found' });
    } else {
      res.status(200).send({
        message: 'subscriber_was_deleted',
        subscriber_id: deletedSubscriber._id
      });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.getAll = async (req, res) => {
  try {
    let subscribers = await userModel.find({}, '-__v');
    check.isArrayEmpty(subscribers) ? res.status(404).send({ error: 'subscribers_not_found' }) : res.status(200).send(subscribers);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.get = async (req, res) => {
  const subscriberId = req.user_id;
  
  try {
    let subscriber = await userModel.findOne({ _id: subscriberId }, '-__v');
    if (check.isObjectEmpty(subscriber)) {
      res.status(404).send({ error: 'subscriber_not_found' });
    } else {
      res.status(200).send(subscriber);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.update = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    const subscriberId = req.user_id;
    const subscriberData = req.body;

    console.log(JSON.stringify(subscriberData));

    if (subscriberData.password === undefined) {
      res.status(400).send({ error: 'password_not_provided' });
      return 0;
    }

    const password = passwordManager.genHashPassword(subscriberData.password);
    subscriberData.password = password.password;
    subscriberData.salt = password.salt;


    const data = {
      $set: subscriberData
    };

    const options = {
      upsert: false,
      new: true,
      runValidators: true
    };

    try {
      let updatedSubscriber = await userModel.findOneAndUpdate({ _id: subscriberId }, data, options);

      if (check.isObjectEmpty(updatedSubscriber)) {
        res.status(404).send({ status: 'subscriber_not_found' });
      } else {
        // res.status(200).send({user: updated_sub, token:subscriberJwt});
        res.status(200).send({
          status: 'subscriber_was_updated',
          user: updatedSubscriber
        });
      }
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        const pathRegex = err.message.match(/(?<=\bindex:\s)(\w+)/)
        const path = pathRegex ? pathRegex[1] : '';
        res.status(422).send({ status: 'key_already_exists', fields: path.replace(/_|1/g,'') });
       } else if (err.name === 'ValidationError') {
        res.status(400).send({ status: 'fields_are_required', fields: Object.keys(err.errors)});
      } else {
        res.status(400).send({ status: err.message });
      }
    }
  }
};

module.exports.create = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    const subscriberData = req.body;

    if (subscriberData.password === undefined) {
      res.status(400).send({ error: 'password_not_provided' });
      return 0;
    }

    const password = passwordManager.genHashPassword(subscriberData.password);
    subscriberData.password = password.password;
    subscriberData.salt = password.salt;

    subscriberData.is_subscribed = false;

   

  
    // console.log(`DATA = ${JSON.stringify(subscriberData)}`);
    try {
      let updatedSubscriber = await userModel.create(subscriberData);

        res.status(200).send({
          message: 'subscriber_was_created',
          subscriber_id: updatedSubscriber._id
        });
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        const pathRegex = err.message.match(/(?<=\bindex:\s)(\w+)/)
        const path = pathRegex ? pathRegex[1] : '';
        res.status(400).send({ error: 'key_already_exists', fields: path.replace(/_|1/g,'') });
       } else if (err.name === 'ValidationError') {
        res.status(400).send({ error: 'fields_are_required', fields: Object.keys(err.errors)});
      } else {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

// User subscriptions

module.exports.getSubscriptionById = async (req, res) => {
  const subscriberId = req.user_id;

  try {
    let subscriber = await userModel.findOne({ _id: subscriberId }, 'subscriber subscription');
    if (check.isObjectEmpty(subscriber)) {
      res.status(404).send({ error: 'subscription_not_found' });
    } else {
      res.status(200).send(subscriber);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};


module.exports.computePayment = async (req, res) => {
  const subscriberId = req.user_id;
  const code = req.body.promocode;
  let discount = 0;

  let settings = await settingsController.getPsSettings();
  
  if (code){
    let promocode = await promocodeModel.findOne({ code: code });
    // console.log(`S=${promocode}`);
    
    if (!promocode){
      res.status(400).send({error:'promocode_not_provided'});
      return;
    }
    
    if (promocode.expires_date > Date.now() ){
      res.status(400).send({error:'promocode_not_valid'});
      return;
    }
    discount = (promocode.discount) ? promocode.discount : discount;
  }
  
  let subscr = null;
  try{
    let query = await subscriptionModel.find().limit(1);
     subscr = query[0];
  }catch(er){
    res.status(400).send({error:'subscription_not_found'});
    return;
  }

  discount = 33;
  console.log( (discount>0) );
  let cost =  (discount>0) ?  Math.round(subscr.prices.amount*(1-(discount/100))) : subscr.prices.amount;


  let salt = passwordManager.salt(32);
  let payment_request = [
    { pg_merchant_id: settings.pg_merchant_id },
    { pg_amount: cost },
    { pg_currency: 'KZT'},
    { pg_description: 'Moon Service' },
    { pg_salt: salt },
    { pg_language: 'ru' },
    { tl_subscriber_id: subscriberId },
    { tl_subscribtion_id: subscr.id },
    { pg_result_url: 'http://81.255.198.100/api/paybox/result' }
        ]
  
        let keys = []
        payment_request.map( item => { keys.push( Object.keys(item)[0] ) });
        let sorted = []
        keys.sort().forEach( key => {
          let a = payment_request.filter( item => Object.keys(item)[0] === key );
          sorted.push(...a);
        });


  let payload = {};
      sorted.map( a => {
        for(let k in a ){
          payload[k] = a[k];
        }
      });

    // console.log( typeof payload, payload );



    // console.log( payload );

    payload = { 0:'payment.php', ...payload, s: settings.secret_key }

    // console.log( payload );

    let unsigned_str = '';
    for(let k in payload){
      unsigned_str += payload[k] + ';';
    }

    unsigned_str = unsigned_str.slice(0,-1);

    // console.log( unsigned_str );

    let signed_str = passwordManager.sign( unsigned_str );



    delete payload['0'];
    delete payload['s'];

    payload = { ...payload, pg_sig:signed_str };

    // console.log( payload );

    let params = '';
    for( let k in payload ){
      params += `${ k }=${ payload[ k ] }&`
    }

    params = params.slice(0, -1);

  res.status(200).send({
    message: 'payment_ready',
    price: cost,
    url: `https://api.paybox.money/payment.php?${ params }`
  });
  
}
// Test
module.exports.auth = async (req, res) => {
try{
  console.log('AUTHORIZED');
  // console.log(JSON.stringify(subscriberId));
   res.status(200).send({er:'OK'});

} catch(e){
  return res.status(403).send({er:'OK'});
}

};

module.exports.testPayment = async (req, res) => {
  let salt = passwordManager.salt(32);
  let payment_request = [
    { pg_merchant_id: 520369 },
    { pg_amount: 1111 },
    { pg_currency: 'KZT'},
    { pg_order_id :'123'},
    { pg_result_url : 'https://example.com'},
    { pg_description: 'Product' },
    { pg_salt: salt },
    { pg_language: 'ru' },
    // { pg_payment_system:'TEST'}
        ]
  
        let keys = []
        payment_request.map( item => { keys.push( Object.keys(item)[0] ) });
        let sorted = []
        keys.sort().forEach( key => {
          let a = payment_request.filter( item => Object.keys(item)[0] === key );
          sorted.push(...a);
        });

      let payload = {};
      sorted.map( a => {
        for(let k in a ){
          payload[k] = a[k];
        }
      });

    console.log( typeof payload, payload );



    console.log( payload );

    payload = { 0:'payment.php', ...payload, s:'SU4vL4w6xTK7UKoU' }

    console.log( payload );

    let unsigned_str = '';
    for(let k in payload){
      unsigned_str += payload[k] + ';';
    }

    unsigned_str = unsigned_str.slice(0,-1);

    console.log( unsigned_str );

    let signed_str = passwordManager.sign( unsigned_str );



    delete payload['0'];
    delete payload['s'];

    payload = { ...payload, pg_sig:signed_str };

    console.log( payload );

    let params = '';
    for( let k in payload ){
      params += `${ k }=${ payload[ k ] }&`
    }

    params = params.slice(0, -1);

  res.status(200).send({
    message: 'payment_ready',
    url: `https://api.paybox.money/payment.php?${ params }`
  });
}

