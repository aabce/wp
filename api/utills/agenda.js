'use strict';

const configs = require(`${__dirname}/../configs/config.json`);
const Agenda = require('agenda');

const agenda = new Agenda({ db: { address: configs.mongodb.url, collection: 'messages' } });

agenda.start();

module.exports = agenda;
