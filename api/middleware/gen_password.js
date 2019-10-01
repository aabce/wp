'use strict';

const crypto = require('crypto');

function generateSalt(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function sha256(password, salt) {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

module.exports.genHashPassword = (plainPassword) => {
  const salt = generateSalt(32);
  const password = sha256(plainPassword, salt);

  return { password, salt }
};

module.exports.genHashPasswordWithSalt = (plainPassword, salt) => {
  const password = sha256(plainPassword, salt);

  return { password, salt }
};

module.exports.getHashPassword = (plainPassword, salt) => sha256(plainPassword, salt);

module.exports.getRandomCode = (length) => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};
