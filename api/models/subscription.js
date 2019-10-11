'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;

const subscriptionSchema = new mongoose.Schema({
  is_active : {
    type: Boolean,
    default: true,
    },
  title: {
    type: String,
  },
  prices: {
    amount: {
      type: Number,
    },
    currency: {
      type: String,
    },
  }
},
{
  timestamps: true
});

mongoose.model('Subscription', subscriptionSchema, 'subscriptions');
