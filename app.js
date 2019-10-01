'use strict';
const configs = require(`${__dirname}/api/configs/config.json`);
const log = require(`${__dirname}/api/middleware/log.js`);
const express = require('express');
const cors = require('cors');
require(`${__dirname}/api/database/mongo_db.js`);
const bodyParser = require('body-parser');



const subscriptionRoutes = require(`${__dirname}/api/services/subscription/routes/subscription.js`);
const subscriberRoutes = require(`${__dirname}/api/services/subscription/routes/subscriber.js`);
const messageRoutes = require(`${__dirname}/api/services/subscription/routes/message.js`);
const promoCodeRoutes = require(`${__dirname}/api/services/subscription/routes/promo_code.js`);

const app = express();
const serverPort = process.env.PORT || configs.server_port;

app.use(cors());
app.use('/documents',express.static('fileStore'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(log.log);

app.get('/', (req, res, next) => res.status(200).send({url: req.url, message: `server_is_running`})); //200.

app.use('/api', subscriptionRoutes);
app.use('/api', subscriberRoutes);
app.use('/api', messageRoutes);
app.use('/api', promoCodeRoutes);

app.use((req, res, next) => res.status(404).send({url: req.url, message: `route_not_found`})); // 404.
app.use((err, req, res, next) => res.status(500).send({error: err.message})); // 500.

app.listen(serverPort, (err) => err ? log.customLog('INFO', `Error: ${err.message}`) : log.customLog('INFO', `Server listening on port: ${serverPort}`));
