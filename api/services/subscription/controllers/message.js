'use strict';

const configs = require(`${__dirname}/../../../configs/config.json`);
const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;
const messageModel = mongoose.model('Message');
const subscriberModel = mongoose.model('Subscriber');
const agenda = require(`${__dirname}/../../../middleware/agenda.js`);
const whatsApp = require(`${__dirname}/../../../middleware/whats_app.js`);

const isArrayEmpty = array => array === undefined || array.length == 0 ? true : false;
const isObjectEmpty = object => object === null || !Object.keys(object).length ? true : false;



const sendMessage = async (text, file) => {
  const subscribers = await subscriberModel.find({ is_subscribed: true }, 'phone first_name last_name');
  for (let subscriber of subscribers) {
    whatsApp.sendMessage(subscriber, text);

    if (file){
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



module.exports.selectAllMessages = async (req, res) => {
  try {
    const messages = await agenda.jobs({}, { _id: -1 });
    // let messages = await messageModel.find({}, '-__v');
    isArrayEmpty(messages) ? res.status(404).send({ status: 'messages_not_found' }) : res.status(200).send(messages);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.selectMessageById = async (req, res) => {
  const messageId = req.params.message_id;

  if (mongoose.Types.ObjectId.isValid(messageId)) {
    try {
      const message = await agenda.jobs({ _id: mongoose.Types.ObjectId(messageId) });
      // let message = await messageModel.findById(messageId, '-__v');

      if (isArrayEmpty(message)) {
        res.status(404).send({ status: 'message_not_found' });
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

module.exports.createMessage = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const rawfileData = req.file || null;


    let messageData = req.body;
    let file = {}; 

    if ( rawfileData ){
      
      file.originalname = rawfileData.originalname;
      file.filename =  `http://localhost:5000/documents/${ rawfileData.filename }` ;
      file.size = rawfileData.size;
      file.path = rawfileData.path;
      file.mimetype = rawfileData.mimetype;
    }


    try {
      const createdMessage = await agenda.schedule(
          new Date(messageData.schedule_date), 
          'schedule_message', 
          { text: messageData.text, is_sended: false, file:file },
        );
      // const createdMessage = await messageModel.create(messageData);

      res.status(200).send({
        status: 'message_was_created',
        id: createdMessage.attrs._id,
        scheduled_at: createdMessage.attrs.nextRunAt
      });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
};

module.exports.updateMessageById = async (req, res) => {
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

module.exports.deleteMessageById = async (req, res) => {
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
