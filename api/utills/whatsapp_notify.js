'use strict';
require('module-alias/register');
const mongoose = require('mongoose');
const tellaParser = require('@tella-utills/parser');
const settingsModel = mongoose.model('Settings');
const fetch = require('node-fetch');

const messageView = (text, first_name, last_name) => `Уважаемый подписчик _${first_name}_ _${last_name}_\n\n${text}`;


const wp_configs = async () => {
  try{
    let settings = await settingsModel.find().limit(1);
    return settings[0].wp
  }catch( err ){
    console.log(`WP_ERR:${err}`);
    return null;
  }
}

module.exports.sendMessage = async (subscriber, text) => {
  const configs = await wp_configs();
  const url = `${configs.api_url}sendMessage?token=${configs.token}`;
  // console.log(`url:${JSON.stringify(url)}`);
  let message = messageView(text, subscriber.first_name, subscriber.last_name);
  
  let msg = message.replace(/<\s*p[^>]*>/g, ' ')
      .replace(/<\s*\/\s*p>/g, '\n')
      .replace(/<\s*em[^>]*>|<\s*\/\s*em>/g, '_')
      .replace(/<\s*strong[^>]*>|<\s*\/\s*strong>/g, '*')
      .replace(/<\s*s*>|<\s*\/\s*s>/g, '~');
  
  const data = {
    phone: subscriber.phone, //'77755505497' not + or 8 just 7_
    body: msg,
  };

  const body = {
    method: 'post',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  };

  try {
    const response = await fetch(url, body);
    const json = await response.json();
    console.log(`good:${JSON.stringify(json)}`);
  } catch (err) {
    console.log(err);
  }
};

module.exports.sendFile = async (subscriber, file) => {
  const configs = wp_configs();
  const url = `${configs.api_url}sendFile?token=${configs.token}`;
  
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
  const configs = wp_configs();
  const url = `${configs.api_url}messages?token=${configs.token}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    console.log(json);
  } catch (err) {
    console.log(err);
  }
};
