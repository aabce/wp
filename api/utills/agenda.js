'use strict';
require('module-alias/register');

const configs = require(`@tella-configs/config.json`);
const Agenda = require('agenda');

const agenda = new Agenda({ db: { address: configs.mongodb.url, collection: 'messages' } });

agenda.start();

module.exports = agenda;
