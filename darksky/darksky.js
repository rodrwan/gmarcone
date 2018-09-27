const fetch = require('node-fetch');
const querystring = require('querystring');

const { DARKSKY_API_URL, DARKSKY_API_CALLS } = process.env;

class Darksky {
  constructor(bearer, redisClient, expiry) {
    this.bearer = bearer;
    this.redisClient = redisClient;
    this.expiry = expiry;
  }

  forecast(latitude, longitude, lang) {
    return new Promise((resolve, reject) => {
      const key = `${latitude},${longitude}#${lang}`;
      this.redisClient.get(key, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        if (data !== null) {
          console.log('in Darksky cache');
          resolve(JSON.parse(data));
        } else {
          console.log('not in Darksky cache');
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
                return reject(new Error('Service unavailable'));
              }
              return res.json();
            })
            .then(res => {
              // set redis cache in seconds 'EX'
              this.redisClient.set(key, JSON.stringify(res), 'EX', this.expiry);
              if (res.hasOwnProperty('code')) {
                if (res.code === 400) {
                  return reject(new Error('bad request'));
                }
              }
              resolve(res);
            })
            .catch(err => reject(err));
        }
      });
    });
  }
}

module.exports = Darksky;
