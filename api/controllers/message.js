'use strict';
require('module-alias/register');
const mongoose = require('mongoose');
const messageModel = mongoose.model('Message');
const userModel = mongoose.model('User');
const agenda = require(`@tella-utills/agenda.js`);
const whatsApp = require(`@tella-utills/whatsapp_notify.js`);
const check = require(`@tella-utills/check.js`);
const server_configs = require('@tella-configs/config.json');
// const sendMail = require(`@tella-utills/email_notify.js`);
const fetch = require('node-fetch');
const schedule = require('node-schedule');




const sendMessage = async (text, file) => {
  const subscribers = await userModel.find({ subscriber: true }, 'phone first_name last_name');
  for (let subscriber of subscribers) {
    console.log(JSON.stringify('sending...'));
    whatsApp.sendMessage(subscriber, text);
    
    if (file){
      console.log(JSON.stringify('sending...'));
      whatsApp.sendFile(subscriber, file);
    }
  }
};



agenda.define('schedule_message', async (job) => {
  const text = job.attrs.data.text;
  job.attrs.data.is_sended = true;
  const file = job.attrs.data.file || null;
  await sendMessage(text, file);
});



module.exports.getAll = async (req, res) => {
  try {
    const messages = await agenda.jobs({});
    // const messages = await agenda.jobs({}, { _id: -1 });
    // let messages = await messageModel.find({}, '-__v');
    check.isArrayEmpty(messages) ? res.status(404).send({ error: 'messages_not_found' }) : res.status(200).send(messages);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.getById = async (req, res) => {
  const messageId = req.params.id;

  if (mongoose.Types.ObjectId.isValid(messageId)) {
    try {
      const message = await agenda.jobs({ _id: mongoose.Types.ObjectId(messageId) });
      // let message = await messageModel.findById(messageId, '-__v');

      if (check.isArrayEmpty(message)) {
        res.status(404).send({ error: 'message_not_found' });
      } else {
        res.status(200).send(message[0].attrs);
      }
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  } else {
    res.status(400).send({ error: 'invalid_id' });
  }
};

module.exports.create = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(204).send({ error: 'payload_is_empty' });
  } else {
    const rawfileData = req.file || null;


    let messageData = req.body;
    let file = {}; 

    if ( rawfileData ){
      
      file.originalname = rawfileData.originalname;
      file.filename =  `http://${server_configs.server_host}:${server_configs.server_port}/documents/${ rawfileData.filename }` ;
      file.size = rawfileData.size;
      file.path = rawfileData.path;
      file.mimetype = rawfileData.mimetype;
    }

    
    messageData.schedule_date = ( messageData.schedule_date ) ? messageData.schedule_date : Date.now();
    console.log(`MD:${JSON.stringify((messageData))}`);
    
    try {

      
      var date = ( messageData.schedule_date ) ? new Date(messageData.schedule_date) : new Date( new Date().getTime()+60000);
      console.log( JSON.stringify( date ) );
      sendMessage( messageData.text, file );
      var j = schedule.scheduleJob(date, function(){
        console.log('The world is going to end today.');
      });
      // const createdMessage = await agenda.schedule(
      //     new Date(messageData.schedule_date), 
      //     'schedule_message', 
      //     { text: messageData.text, is_sended: false, file:file },
      //   );
      // const createdMessage = await messageModel.create(messageData);

      res.status(200).send({
        message: 'message_was_created',
        // id: createdMessage.attrs._id,
        // scheduled_at: createdMessage.attrs.nextRunAt
      });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
};

module.exports.update = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const messageId = req.params.message_id;

    if (mongoose.Types.ObjectId.isValid(messageId)) {
      const messageData = req.body;

      // const options = {
      //   upsert: false,
      //   new: true
      // };
      //
      // const data = {
      //   $set: messageData,
      // };

      try {
        // let updatedMessage = await messageModel.findByIdAndUpdate(messageId, data, options);

        const message = await agenda.jobs({ _id: mongoose.Types.ObjectId(messageId) });

        if (isArrayEmpty(message)) {
          res.status(404).send({ status: 'message_not_found' });
        } else {
          await agenda.cancel({ _id: mongoose.Types.ObjectId(messageId) });
          let updatedMessage = await agenda.schedule(new Date(messageData.schedule_date), 'schedule_message', { text: messageData.text, is_sended: false });

          res.status(200).send({
            status: 'message_was_updated',
            id: updatedMessage.attrs._id
          });
        }
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    } else {
      res.status(400).send({ error: 'invalid_id' });
    }
  }
};

module.exports.delete = async (req, res) => {
  const messageId = req.params.message_id;

  if (mongoose.Types.ObjectId.isValid(messageId)) {
    try {
      const deletedMessage = await agenda.cancel({ _id: mongoose.Types.ObjectId(messageId) });
      // let deletedMessage = await messageModel.findByIdAndDelete(messageId);

      if (deletedMessage) {
        res.status(200).send({
          status: 'message_was_deleted',
          id: deletedMessage
        });
      } else {
        res.status(404).send({ status: 'message_not_found' });
      }
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  } else {
    res.status(400).send({ error: 'invalid_id' });
  }
};

