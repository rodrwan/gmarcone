const fetch = require('node-fetch');
const querystring = require('querystring');

const { DARKSKY_API_URL, DARKSKY_API_CALLS } = process.env;
/*
  Darksky is a simple HTTP client that allow to communicate with darksky API.
  Also, result are inserted into a redis cache, in order to speed responses and make
  less request to the API service.
*/
class Darksky {
  /*
  @bearer string token that allow to authenticate request
  @redisClient object connect redis db to store cache
  @expiry number time when cache expires
   */
  constructor(bearer, redisClient, expiry) {
    this.bearer = bearer;
    this.redisClient = redisClient;
    this.expiry = expiry;
  }

  forecast(latitude, longitude, lang) {
    return new Promise(async resolve => {
      const key = `${latitude},${longitude}`;
      const [err, data] = await this.redisClient.getByKey(key);
      if (err) {
        return resolve([err, null]);
      }

      if (data !== null) {
        console.log('Darksky: get data from redis');
        return resolve([null, JSON.parse(data)]);
      }

      const queries = querystring.stringify({
        lang,
        exclude: 'minutely,hourly,alerts',
        units: 'si'
      });

      const URL = `${DARKSKY_API_URL}/${this.bearer}/${latitude},${longitude}?${queries}`;

      fetch(URL)
        .then(res => {
          const calls = parseInt(res.headers.get('X-Forecast-API-Calls'), 10);

          if (calls > parseInt(DARKSKY_API_CALLS, 10)) {
            return Promise.reject(new Error('Service unavailable'));
          }
          return res.json();
        })
        .then(async res => {
          // set redis cache in seconds 'EX'
          await this.redisClient.setWithExpiry(key, JSON.stringify(res), this.expiry);
          if (res.hasOwnProperty('code')) {
            if (res.code === 400) {
              return Promise.reject(new Error('bad request'));
            }
          }

          return resolve([null, res]);
        })
        .catch(err => resolve([err, null]));
    });
  }
}

module.exports = Darksky;
