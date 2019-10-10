'use strict';
require('module-alias/register');
const configs = require(`@tella-configs/config.json`);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userModel = mongoose.model('User');

module.exports.admin = ( is_admin ) =>{
  return async function  (req, res, next)  {
    
    
    // console.log(`DECODED ${JSON.stringify(req.decoded)}`);
    const user = await userModel.findOne({ _id:req.decoded._id });

   
    if (user && user.is_admin === is_admin){
      console.log(`ALLOWED`);
      next();
    
    }else{

      return res.status(403).send({
        error: 'Not permited'
      });
    }
  }
};

module.exports.adminOrSelf = () =>{
  return async function  (req, res, next)  {
    
    
    // console.log(`DECODED ${JSON.stringify(req.decoded)}`);
    const user = await userModel.findOne({ _id:req.decoded._id });

   
    if (user && user.is_admin){
      console.log(`ALLOWED`);
      req.user_id = req.query.subscriber_id || user._id;
      next();
    
    }else if ( user ){
      req.user_id = req.decoded._id;
      next();
    }
  }
};
