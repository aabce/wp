'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
  },
  schedule_date: {
    type: Date,
  },
  file: {
    originalname: {
      type: String,
      require: true
    },  
    filename: {
      type: String,
      require: true
    },  
    size: {
      type: String,
      require: true
    },  
    path: {
      type: String,
      require: true
    },  
    mimetype: {
      type: String,
      require: true
    }  
  }
  });

mongoose.model('Message', messageSchema, 'messages');
