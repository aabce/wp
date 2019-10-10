'use strict';
require('module-alias/register');
const configs = require(`@tella-configs/config.json`);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userModel = mongoose.model('User');

module.exports.verifyJWT = async (req, res, next) => {
  try {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    } else {
      return res.status(401).send({
        error: 'auth_token_is_not_supplied'
      });
    }

    try {
      const jwtResult = await jwt.verify(token, configs.jwt.secret);
  
      const user = await userModel.findOne({ _id:jwtResult._id });


      if (user.token === token) {
        req.decoded = jwtResult;
        next();
      } else {
        return res.status(403).send({
          error: 'token_is_not_valid'
        });
      }
    } catch (err) {
      return res.status(403).send({
        error: 'token_is_not_valid'
      });
    }
  } catch (err) {
    return res.status(404).send({
      error: 'auth_header_is_not_supplied'
    });
  }
};
