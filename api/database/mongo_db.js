'use strict';
require('module-alias/register');

const configs = require(`@tella-configs/config.json`);
const log = require(`@tella-middlewares/log.js`);
const mongoose = require('mongoose');

const onTerminate = () => {
  mongoose.connection.close(() => {
    console.log('INFO', `Close MongoDB Connection`);
    process.exit(0);
  });
}

mongoose.connect(configs.mongodb.url, configs.mongodb.options);

mongoose.connection.on('connected', () => {
  console.log('INFO', `Mongoose connected to: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.db.databaseName}`);
});

mongoose.connection.on('reconnect', () => {
  console.log('INFO', `MongoDB reconnected`);
});

mongoose.connection.on('timeout', () => {
  console.log('INFO', `MongoDB timeout`);
});

mongoose.connection.on('error', (err) => {
  console.log('INFO', `Failed to Connect MongoDB: ${err}`);
  // process.exit(0);
});

mongoose.connection.on('disconnected', () => {
  console.log('INFO', `MongoDB Disconnected`);
});
// remote configs // thi.reference
require(`@tella-models/settings.js`);
require(`@tella-models/account.js`);
require(`@tella-models/promocode.js`);
require(`@tella-models/subscription.js`);
// require(`@tella-models/message.js`);

process.on('SIGINT', onTerminate).on('SIGTERM', onTerminate);
