'use strict';
require('module-alias/register');
const configs = require(`@tella-configs/config.json`);
const mongoose = require('mongoose');
const settingsModel = mongoose.model('Settings');
const check = require(`@tella-utills/check.js`);

module.exports.update = async (req, res) => {
  if (check.isObjectEmpty(req.body)) {
    res.status(400).send({ error: 'payload_is_empty' });
  } else {
    const settingsData = req.body;
    const data = {
      $set: settingsData
    };
    
    const options = {
      upsert: true,
      new: true,
      runValidators: true
    };
    
    try {
      
        let settings = await settingsModel.find();
        let settings_id = ( settings[0] ) ? settings[0]._id : undefined ;
        let updatedsettings = null;
        if (settings_id){
          updatedsettings = await settingsModel.findOneAndUpdate({ _id : settings_id}, data, options);
        }else{
          updatedsettings = await settingsModel.create(settingsData);
        }

      if (check.isObjectEmpty(updatedsettings)) {
        res.status(404).send({ error: 'settings_not_found' });
      } else {
        res.status(200).send({
          message: 'settings_was_updated',
          settings_id: updatedsettings._id
        });
      }
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        const pathRegex = err.message.match(/(?<=\bindex:\s)(\w+)/)
        const path = pathRegex ? pathRegex[1] : '';
        res.status(422).send({ status: 'key_already_exists', fields: path.replace(/_|1/g,'') });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ error: 'fields_are_required', fields: Object.keys(err.errors)});
      } else {
        res.status(400).send({ error: err.message });
      }
    }
  }
};




module.exports.get = async (req, res) => {
    // console.log(JSON.stringify(settingsData));
    let setting = await this.getSettings();
    return setting === null ? { status: 404, error: 'settings_not_found' } : setting;
}


module.exports.getSettings = async () => {
  // console.log(JSON.stringify(settingsData));
  try {
    let settings = await settingsModel.find().limit(1);
    //  console.log('SETTINGS == '+JSON.stringify(settings));
    if (check.isObjectEmpty(settings)) {

      return null;

    } else {

      return  settings[0];
    }
  } catch (err) {
      return null;

    
  }
}


module.exports.getPsSettings = async () => {
  let settings = await this.getSettings();
  
  if (check.isObjectEmpty(settings) && !('ps' in settings)) {
    return null;
    
  } else {
    
    // console.log('SETTINGS PS == '+JSON.stringify(settings.ps.pg_merchant_id));
      return settings.ps;
    }
}
