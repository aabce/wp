'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;

const promoCodeSchema = new mongoose.Schema({
  promo_code: {
    type: String,
    unique: true,
  },
  discount_rate: {
    type: Number,
    min: 0,
    max: 100,
  },
  expires_date: {
    type: Date,
  },
  number_of_uses: {
    type: Number,
  }
});

mongoose.model('PromoCode', promoCodeSchema, 'promo_codes');
