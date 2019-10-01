'use strict';

const mongoose = require('mongoose');
const promoCodeModel = mongoose.model('PromoCode');
const roundNumber = require(`${__dirname}/../../../middleware/round_number.js`);

const isArrayEmpty = array => array === undefined || array.length == 0 ? true : false;
const isObjectEmpty = object => object === null || !Object.keys(object).length ? true : false;



module.exports.selectAllPromocodes = async (req, res) => {
  try {
    let promoCodes = await promoCodeModel.find({}, '-__v -_id');
    isArrayEmpty(promoCodes) ? res.status(404).send({ status: 'promo_codes_not_found' }) : res.status(200).send(promoCodes);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.selectPromocodeByName = async (req, res) => {
  const promoCode = req.params.promo_code;

  const query = {
    promo_code: promoCode,
  };

  try {
    let promoCodeDoc = await promoCodeModel.findOne(query, '-__v -_id');

    if (isObjectEmpty(promoCodeDoc)) {
      res.status(404).send({ status: 'promo_code_not_found' });
    } else {
      res.status(200).send(promoCodeDoc);
    }
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

module.exports.getPriceWithDiscount = async (req, res) => {
  let price = req.params.price;
  const promoCode = req.params.promo_code;

  try {
    let promocodeDoc = await promoCodeModel.find({ promo_code: promoCode });

    if (isObjectEmpty(promocodeDoc)) {
      res.status(404).send({ status: 'promocode_not_found', price: price, rate: 0});
    } else {
      price = Number(price);
      const priceWithDiscount = (price - ((price * promocodeDoc[0].discount_rate) / 100)).toFixed(0);
      res.status(200).send({amount: Number(priceWithDiscount), rate: promocodeDoc[0].discount_rate});
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.createPromocode = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const promoCodeData = req.body;

    try {
      let createdPromoCode = await promoCodeModel.create(promoCodeData);

      res.status(200).send({
        status: 'promo_code_was_created',
        promo_code: createdPromoCode._id
      });
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(422).send({ status: 'key_already_exists' });
      } else {
        res.status(400).send({ error: err.message });
      }
    }
  }
};

module.exports.updatePromocodeRateByName = async (req, res) => {
  if (isObjectEmpty(req.body)) {
    res.status(204).send({ status: 'payload_is_empty' });
  } else {
    const promoCode = req.params.promo_code;
    const promocodeData = req.body;

    const query = {
      promo_code: promoCode
    };

    const options = {
      upsert: false,
      new: false,
      runValidators: true,
    };

    const data = {
      $set: promocodeData
    };

    try {
      let updatedPromocode = await promoCodeModel.findOneAndUpdate(query, data, options);

      if (isObjectEmpty(updatedPromocode)) {
        res.status(404).send({ status: 'promocode_not_found' });
      } else {
        res.status(200).send({
          status: 'promocode_was_updated',
          promo_code: updatedPromocode._id
        });
      }
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
};

module.exports.deletePromocodeByName = async (req, res) => {
  const promoCode = req.params.promo_code;

  const query = {
    promo_code: promoCode,
  };

  try {
    let deletedPromocode = await promoCodeModel.findOneAndDelete(query);

    if (isObjectEmpty(deletedPromocode)) {
      res.status(404).send({ status: 'promocode_not_found' });
    } else {
      res.status(200).send({
        status: 'promocode_was_deleted',
        promo_code: deletedPromocode._id
      });
    }
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

module.exports.getPriceWithDiscountLocal = async (price, promo_code = '') => {
  try {
    let promocodeDoc = await promoCodeModel.find({promo_code: promo_code});

    if (isObjectEmpty(promocodeDoc)) {
      return { amount: Number(price), rate: 0 };
    } else {
      price = Number(price);
      const priceWithDiscount = roundNumber.roundNumber((price - ((price * promocodeDoc[0].discount_rate) / 100)));
      return { amount: priceWithDiscount, rate: promocodeDoc[0].discount_rate };
    }
  } catch (err) {
    return err;
  }
};
