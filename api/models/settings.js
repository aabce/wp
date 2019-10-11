'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;

const settingsSchema = new mongoose.Schema({

  // by: {
  //   type: mongoose.Schema.Types.ObjectId, ref: 'User'
  // },

  // email:
  
  email: {
    auth:{
      user: {
        type: String,
      },
      pass: {
        type: String,
      },
    },

    host: {
      type: String,
    },

    port: {
      type: Number,
    },

  },

    wp: {
      api_url: {
        type:String,
      },
  
      token: {
        type:String,
      }

    }

},
{
  timestamps: true
});

mongoose.model('Settings', settingsSchema, 'settings');
