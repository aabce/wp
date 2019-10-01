'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;

const subscriberSchema = new mongoose.Schema({
  phone: {
    type: String,
    unique: true,
    validate: (phone) => {
       return /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/.test(phone);
    },
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: (email) => {
       return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);
    },
  },
  password: {
    type: String,
  },
  salt: {
    type: String,
  },
  is_subscribed: {
    type: Boolean,
  },
  is_unlimited: {
    type: Boolean,
  },
  created_at: {
    type: Date,
    default: null,
  },
  updated_at: {
    type: Date,
    default: null,
  },
  token: {
    type: String,
  },
  reset_password_code: {
    type: String,
  },
  reset_password_expires: {
    type: Date,
  },
  subscription_date: {
    type: Date,
  },
  subscription_expires: {
    type: Date,
  }
});

mongoose.model('Subscriber', subscriberSchema, 'subscribers');
