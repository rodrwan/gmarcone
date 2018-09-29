require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Redis = require('./redis/redis');
const morgan = require('morgan');

const Darksky = require('./darksky/darksky');
const GeoCode = require('./geocode/geocode');
const Restcountries = require('./restcountries/restcountries');
const routes = require('./routes/routes');

const {
  PORT,
  REDIS_PORT,
  REDIS_HOST,
  DARKSKY_TOKEN,
  GEOCODE_API_TOKEN,
  CACHE_INTERVAL
} = process.env;

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(cors());
app.use(morgan(':method :url :response-time'));

const redisClient = new Redis(REDIS_PORT, REDIS_HOST);
const darkskyClient = new Darksky(DARKSKY_TOKEN, redisClient, CACHE_INTERVAL);
const geocodeClient = new GeoCode(GEOCODE_API_TOKEN, redisClient, CACHE_INTERVAL);
const restcountriesClient = new Restcountries(redisClient, CACHE_INTERVAL);
app.use('/api', routes(darkskyClient, geocodeClient, restcountriesClient));

let port = PORT || 8080;
// Launch app to listen to specified port
app.listen(port, () => {
  console.log('Running gMarcone on port ' + port);
});
