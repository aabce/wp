'use strict';
require('module-alias/register');
const mongoose = require('mongoose');
const promoCodeModel = mongoose.model('Promocode');
const roundNumber = require(`@tella-utills/round_number.js`);
const check = require(`@tella-utills/check.js`);


module.exports.createPromocode = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
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
}

module.exports.getAll = async (req, res) => {
  try {
    let promoCodes = await promoCodeModel.find({}, '-__v -_id');
    check.isArrayEmpty(promoCodes) ? res.status(404).send({ status: 'promo_codes_not_found' }) : res.status(200).send(promoCodes);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports.getById = async (req, res) => {
  const promocode_id = req.params.id;

  const query = {
    _id: promocode_id,
  };

  try {
    let promoCodeDoc = await promoCodeModel.findOne(query, '-__v -_id');

    if (check.isObjectEmpty(promoCodeDoc)) {
      res.status(404).send({ error: 'promo_code_not_found' });
    } else {
      res.status(200).send(promoCodeDoc);
    }
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

module.exports.update = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(204).send({ error: 'payload_is_empty' });
  } else {
    const promocode_id = req.params.id;
    const promocodeData = req.body;

    const query = {
      _id: promocode_id
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

      if (check.isObjectEmpty(updatedPromocode)) {
        res.status(404).send({ error: 'promocode_not_found' });
      } else {
        res.status(200).send({
          message: 'promocode_was_updated',
          id: updatedPromocode._id
        });
      }
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  }
};

module.exports.delete = async (req, res) => {
  const promocode_id = req.params.id;
  // console.log(`PID=${ promocode_id }`);
  const query = {
    _id: promocode_id,
  };

  try {
    let deletedPromocode = await promoCodeModel.findOneAndDelete(query);

    if (check.isObjectEmpty(deletedPromocode)) {
      res.status(404).send({ error: 'promocode_not_found' });
    } else {
      res.status(200).send({
        message: 'promocode_was_deleted',
        id: deletedPromocode._id
      });
    }
  } catch (err) {
    res.status(400).send({ error: err });
  }
};


// module.exports.getPriceWithDiscount = async (req, res) => {
//   let price = req.params.price;
//   const promoCode = req.params.promo_code;

//   try {
//     let promocodeDoc = await promoCodeModel.find({ promo_code: promoCode });

//     if (isObjectEmpty(promocodeDoc)) {
//       res.status(404).send({ status: 'promocode_not_found', price: price, rate: 0});
//     } else {
//       price = Number(price);
//       const priceWithDiscount = (price - ((price * promocodeDoc[0].discount_rate) / 100)).toFixed(0);
//       res.status(200).send({amount: Number(priceWithDiscount), rate: promocodeDoc[0].discount_rate});
//     }
//   } catch (err) {
//     res.status(400).send({ error: err.message });
//   }
// };

// module.exports.getPriceWithDiscountLocal = async (price, promo_code = '') => {
//   try {
//     let promocodeDoc = await promoCodeModel.find({promo_code: promo_code});

//     if (isObjectEmpty(promocodeDoc)) {
//       return { amount: Number(price), rate: 0 };
//     } else {
//       price = Number(price);
//       const priceWithDiscount = roundNumber.roundNumber((price - ((price * promocodeDoc[0].discount_rate) / 100)));
//       return { amount: priceWithDiscount, rate: promocodeDoc[0].discount_rate };
//     }
//   } catch (err) {
//     return err;
//   }
// };
