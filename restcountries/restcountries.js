const fetch = require('node-fetch');

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
    return new Promise((resolve, reject) => {
      fetch(`${RESTCOUNTRIES_API_URL}/name/${name}?fields=capital`, {
        headers: {
          'Content-type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(res => {
          resolve(res[0]);
        });
    });
  }
}

module.exports = Restcountries;
