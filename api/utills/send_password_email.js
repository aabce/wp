'use strict';
require('module-alias/register');
const emailConfigs = require(`@tella-configs/email.json`);
const nodemailer = require('nodemailer');

module.exports.sendRestoreCode = async (emailAddress, restoreCode) => {
  const transporter = await nodemailer.createTransport(emailConfigs.email_settings);

  const orderMessage = {
      from: emailConfigs.email_settings.auth.user,
      to: emailAddress,
      subject: `Restore Code`,
      text: `Restore Code: ${restoreCode}`
   };

  await transporter.sendMail(orderMessage);
  console.log(`Email sent to ${ JSON.stringify(orderMessage) }`);
};

module.exports.sendRestoreMessage = async (emailAddress) => {
  const transporter = await nodemailer.createTransport(emailConfigs.email_settings);

  const orderMessage = {
      from: emailConfigs.email_settings.auth.user,
      to: emailAddress,
      subject: `Restore Password`,
      text: `Password was changed`
   };

  await transporter.sendMail(orderMessage);
};
