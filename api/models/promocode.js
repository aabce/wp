'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;

const promoCodeSchema = new mongoose.Schema({
  is_active: {
    type: Boolean,
    default:true,
  },

  code: {
    type: String,
    unique: true,
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
  },
  exp: {
    type: Date,
  },
  total: {
    type: Number,
    default: 0,
  },
  counter: {
    type: Number,
    default: 0
  }
});

mongoose.model('Promocode', promoCodeSchema, 'promocodes');
