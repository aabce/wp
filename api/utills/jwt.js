'use strict';
require('module-alias/register');
const configs = require(`@tella-configs/config.json`);
const jwt = require('jsonwebtoken');

module.exports.createJWT = (authData) => jwt.sign(authData, configs.jwt.secret, configs.jwt.options);

module.exports.decode = (token) => {
  try {
    return jwt.decode(token, configs.jwt.secret);
  } catch (err) {
    return err.message;
  }
};

