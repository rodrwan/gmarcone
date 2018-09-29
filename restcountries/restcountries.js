const fetch = require('node-fetch');
const { escape } = require('querystring');
const { RESTCOUNTRIES_API_URL } = process.env;

/*
  GeoCode is a simple HTTP client that allow to communicate with Geocode API.
  Also, result are inserted into a redis cache, in order to speed responses and make
  less request to the API service.
*/
class Restcountries {
  /*
  @bearer string token that allow to authenticate request
  @redisClient object connect redis db to store cache
  @expiry number time when cache expires
   */
  constructor(redisClient, expiry) {
    this.redisClient = redisClient;
    this.expiry = expiry;
  }

  getCountryData(name) {
    return new Promise(resolve => {
      const URL = `${RESTCOUNTRIES_API_URL}/name/${escape(name)}?fields=capital`;
      fetch(URL, {
        headers: {
          'Content-type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(async res => {
          if (res.hasOwnProperty('status')) {
            if (res.status === 404) {
              return resolve([null, {}]);
            }
          }
          const key = `${name}`;
          const [err, data] = await this.redisClient.getByKey(key);
          if (err) {
            return resolve([err, null]);
          }

          if (data !== null) {
            console.log('Restcountries: get data from redis');
            resolve([null, JSON.parse(data)]);
          } else {
            await this.redisClient.setWithExpiry(key, JSON.stringify(res[0]), this.expiry);
            resolve([null, res[0]]);
          }
        })
        .catch(err => resolve([err, null]));
    });
  }
}

module.exports = Restcountries;
