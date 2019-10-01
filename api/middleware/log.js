'use strict';

const moment = require('moment');
const chalk = require('chalk');

module.exports.log = async (req, res, next) => {
  const route = req.url;
  const method = req.method;

  let start = Date.now();

  res.on('finish', () => {
    const currentDateAndTime = moment().format('MM/DD/YYYY hh:mm:ss A');
    let message;
    let duration = Date.now() - start;

    switch (method) {
      case 'GET': {
         message = `[${currentDateAndTime}] - ${chalk.green('GET')}: ${route} ${res.statusCode} - ${res.statusMessage} ${duration} ms`;
         break;
      }
      case 'POST': {
         message = `[${currentDateAndTime}] - ${chalk.yellow('POST')}: ${route} ${res.statusCode} - ${res.statusMessage} ${duration} ms`;
         break;
      }
      case 'PUT': {
         message = `[${currentDateAndTime}] - ${chalk.blue('PUT')}: ${route} ${res.statusCode} - ${res.statusMessage} ${duration} ms`;
         break;
      }
      case 'DELETE': {
         message = `[${currentDateAndTime}] - ${chalk.red('DELETE')}: ${route} ${res.statusCode} - ${res.statusMessage} ${duration} ms`;
         break;
      }
    }

    console.log(`${message}`);
  });

  next();
};

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
