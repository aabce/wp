'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;

const subscriptionSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
  },
  prices: {
    amount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    discount_amount: {
      type: Number,
      default: 0,
    }
  }
});

mongoose.model('Subscription', subscriptionSchema, 'subscriptions');
