'use strict';
require('module-alias/register');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const settingsModel = mongoose.model('Settings');

module.exports.sendRestoreCode = async (emailAddress, restoreCode) => {
  // console.log(`Email == ${ JSON.stringify(emailAddress) }`);

  let settings = null;
  try{
    let query = await settingsModel.find().limit(1);
    settings = query[0];
  }catch(e){
    return false;
  }

  const transporter = await nodemailer.createTransport(settings.email);

  const orderMessage = {
    from: settings.email.auth.user,
    to: emailAddress,
    subject: `Restore Code`,
    text: `Restore Code: ${restoreCode}`
  };
  console.log(`Email sent to ${ JSON.stringify(orderMessage) }`);

  await transporter.sendMail(orderMessage, function (err, info) {
    if(err)
      console.log(`ERROR==${err}`)
    else
      console.log(info);
      // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // works only wth etherial
 });

 return true;
};

module.exports.sendRestoreMessage = async (emailAddress) => {
  let settings = null;
  try{
    let query = await settingsModel.find().limit(1);
    settings = query[0];
  }catch(e){
    return false;
  }

  const transporter = await nodemailer.createTransport(settings.email);

  const orderMessage = {
      from: settings.email.auth.user,
      to: emailAddress,
      subject: `Restore Password`,
      text: `Password was changed`
   };

  await transporter.sendMail(orderMessage);

  return true;
};
