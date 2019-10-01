'use strict';

const configs = require(`${__dirname}/../configs/config.json`);
const jwt = require('jsonwebtoken');

module.exports.createJWT = (authData) => jwt.sign(authData, configs.jwt.secret, configs.jwt.options);

module.exports.decode = (token) => {
  try {
    return jwt.decode(token, configs.jwt.secret);
  } catch (err) {
    return err.message;
  }
};

module.exports.verifyJWT = async (req, res, next) => {
  try {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    } else {
      return res.status(401).send({
        success: false,
        message: 'auth_token_is_not_supplied'
      });
    }

    try {
      const jwtResult = await jwt.verify(token, configs.jwt.secret);
      const user = await userModel.findOne({ _id: jwtResult._id });

      if (user.token === token) {
        req.decoded = jwtResult;
        next();
      } else {
        return res.status(403).send({
          success: false,
          message: 'token_is_not_valid'
        });
      }
    } catch (err) {
      return res.status(403).send({
        success: false,
        message: 'token_is_not_valid'
      });
    }
  } catch (err) {
    return res.status(404).send({
      success: false,
      message: 'auth_header_is_not_supplied'
    });
  }
};
