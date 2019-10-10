'use strict';

const moment = require('moment');
const chalk = require('chalk');

module.exports.customLog = (method, payload) => {
  const currentDateAndTime = moment().format('MM/DD/YYYY hh:mm:ss A');
   let message;

   switch (method) {
      case 'INFO': {
         message = `[${currentDateAndTime}] - ${chalk.magenta('INFO')}: ${payload}`;
         break;
      }
   }

   console.log(message);
};
