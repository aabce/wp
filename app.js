'use strict';
require('module-alias/register');
require(`@tella-database/mongo_db.js`);

const configs = require(`@tella-configs/config.json`);
const log = require(`@tella-middlewares/log.js`);
const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');

const accountRoutes = require(`@tella-routes/account.js`);
// const subscriptionRoutes = require(`@tella-routes/subscription.js`);
// const messageRoutes = require(`@tella-routes/message.js`);
// const promoCodeRoutes = require(`@tella-routes/promo_code.js`);

const app = express();
const serverPort = process.env.PORT || configs.server_port;


// middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(log.log);

// static url
app.use('/documents',express.static('fileStore'));

app.get('/', (req, res, next) => res.status(200).send({url: req.url, message: `server_is_running`})); //200.

// controllers
app.use('/api', accountRoutes);
// app.use('/api', subscriberRoutes);
// app.use('/api', messageRoutes);
// app.use('/api', promoCodeRoutes);

app.use((req, res, next) => res.status(404).send({url: req.url, message: `route_not_found`})); // 404.
app.use((err, req, res, next) => res.status(500).send({error: err.message})); // 500.

app.listen(serverPort, (err) => err ? console.log('INFO', `Error: ${err.message}`) : console.log('INFO', `Server listening on port: ${serverPort}`));
