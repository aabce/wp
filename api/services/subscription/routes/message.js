'use strict';
require('module-alias/register');
const express = require('express');
const router = express.Router();

const multer = require('multer');

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

const messageController = require(`${__dirname}/../controllers/message.js`);

router.get('/subscription/message/get_messages', messageController.selectAllMessages);
router.get('/subscription/message/get_message/:message_id', messageController.selectMessageById);
router.post(
    '/subscription/message/create_message', 
    upload.single('doc'), 
    messageController.createMessage
    );
router.put('/subscription/message/update_message/:message_id', messageController.updateMessageById);
router.delete('/subscription/message/delete_message/:message_id', messageController.deleteMessageById);

module.exports = router;
