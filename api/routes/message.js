'use strict';
require('module-alias/register');

const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('@tella-middlewares/jwt');
const perms = require('@tella-middlewares/perms');
const messageController = require(`@tella-controllers/message.js`);

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './fileStore');
    },
    filename: (req, file, cb) => {
      console.log(file);
      var filetype = '';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }

      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});

var upload = multer({storage: storage});


router.get('/msg', jwt.verifyJWT, perms.admin(true), messageController.getAll);
router.get('/msg/:id', jwt.verifyJWT, perms.admin(true), messageController.getById);
router.post('/msg', jwt.verifyJWT, perms.admin(true), upload.single('doc'),messageController.create);
// router.put('/msg/:id', jwt.verifyJWT, perms.admin(true), messageController.update);
router.delete('/msg/:id', jwt.verifyJWT, perms.admin(true), messageController.delete);

module.exports = router;
