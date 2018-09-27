const fetch = require('node-fetch');
const querystring = require('querystring');

const { GEOCODE_API_URL } = process.env;

/*
  GeoCode is a simple HTTP client that allow to communicate with Geocode API.
  Also, result are inserted into a redis cache, in order to speed responses and make
  less request to the API service.
*/
class GeoCode {
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

  getCountryData(latitude, longitude, lang) {
    return new Promise((resolve, reject) => {
      const key = `${latitude}#${longitude}#${lang}`;
      this.redisClient.get(key, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        if (data !== null) {
          resolve(JSON.parse(data));
        } else {
          const queries = querystring.stringify({
            language: lang,
            latlng: `${latitude},${longitude}`,
            key: this.bearer
          });

          const URL = `${GEOCODE_API_URL}?${queries}`;
          fetch(URL)
            .then(res => res.json())
            .then(res => {
              if (res.results.length > 0) {
                const country = res.results[res.results.length - 1];
                const response = {
                  latitude: country.geometry.location.lat,
                  longitude: country.geometry.location.lng,
                  name: country.formatted_address
                };
                // set redis cache in seconds 'EX'
                this.redisClient.set(key, JSON.stringify(response), 'EX', this.expiry);
                resolve(response);
              } else {
                resolve({});
              }
            });
        }
      });
    });
  }

  getCapitalData(capital, country, lang) {
    return new Promise((resolve, reject) => {
      const key = `${capital}#${country}#${lang}`;
      this.redisClient.get(key, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        if (data !== null) {
          resolve(JSON.parse(data));
        } else {
          // set query parameters
          const queries = querystring.stringify({
            language: lang,
            address: `${capital}, ${country}`,
            key: this.bearer
          });

          const URL = `${GEOCODE_API_URL}?${queries}`;
          fetch(URL)
            .then(res => res.json())
            .then(res => {
              if (res.results.length > 0) {
                const country = res.results[res.results.length - 1];
                // with this we get the country lat and lng
                const response = {
                  latitude: country.geometry.location.lat,
                  longitude: country.geometry.location.lng,
                  name: country.formatted_address
                };
                // set redis cache in seconds 'EX'
                this.redisClient.set(key, JSON.stringify(response), 'EX', this.expiry);
                resolve(response);
              } else {
                resolve({});
              }
            });
        }
      });
    });
  }
}

module.exports = GeoCode;
