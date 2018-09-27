const fetch = require('node-fetch');
const querystring = require('querystring');

const { GEOCODE_API_URL } = process.env;
class GeoCode {
  constructor(bearer, redisClient, expiry) {
    this.bearer = bearer;
    this.redisClient = redisClient;
    this.expiry = expiry;
  }

  getData(latitude, longitude, lang) {
    return new Promise((resolve, reject) => {
      const key = `${latitude}#${longitude}#${lang}`;
      this.redisClient.get(key, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        if (data !== null) {
          console.log('in Geocode cache');
          resolve(JSON.parse(data));
        } else {
          console.log('not in Geocode cache');
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
}

module.exports = GeoCode;
