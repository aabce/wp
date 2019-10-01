'use strict';

const configs = require(`${__dirname}/../configs/config.json`);
const fetch = require('node-fetch');

const APIURL = configs.whats_app.api_url;
const TOKEN = configs.whats_app.token;

const messageView = (text, first_name, last_name) => `Уважаемый подписчик _${first_name}_ _${last_name}_\n\n${text}`;

module.exports.sendMessage = async (subscriber, text) => {
  const url = `${APIURL}sendMessage?token=${TOKEN}`;
  const message = messageView(text, subscriber.first_name, subscriber.last_name);
  const data = {
    phone: subscriber.phone,
    body: message,
  };

  const body = {
    method: 'post',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  };

  try {
    const response = await fetch(url, body);
    const json = await response.json();
    console.log(json);
  } catch (err) {
    console.log(err);
  }
};

module.exports.sendFile = async (subscriber, file) => {
  const url = `${APIURL}sendFile?token=${TOKEN}`;
  let msg = {
    phone: subscriber.phone,
    body: file.filename, //"http://putregai.com/sbooks/clean_arch.pdf"
    filename: file.originalname
  };

  const rbody = {
    method: 'post',
    body: JSON.stringify(msg),
    headers: { 'Content-Type': 'application/json' },
  };


  try {
    const response = await fetch(url, rbody);
    const json = await response.json();
    // console.log(json);
  } catch (err) {
    console.log(err);
  }
};

module.exports.readMessages = async () => {
  const url = `${APIURL}messages?token=${TOKEN}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    console.log(json);
  } catch (err) {
    console.log(err);
  }
};
