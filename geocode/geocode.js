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
    return new Promise(async (resolve, reject) => {
      const [err, data] = await this.redisClient.geoRadius('addresses', latitude, longitude / 2);
      if (err) {
        return reject(err);
      }

      if (data.length > 0) {
        resolve(JSON.parse(data[0]));
      } else {
        const queries = querystring.stringify({
          language: lang,
          latlng: `${latitude},${longitude}`,
          key: this.bearer
        });

        const URL = `${GEOCODE_API_URL}?${queries}`;
        fetch(URL)
          .then(res => res.json())
          .then(async res => {
            if (res.results.length > 0) {
              const country = res.results[res.results.length - 1];
              const response = {
                latitude: country.geometry.location.lat,
                longitude: country.geometry.location.lng,
                name: country.formatted_address
              };

              await this.redisClient.geoAdd(
                'addresses',
                latitude,
                longitude / 2,
                JSON.stringify(response)
              );
              resolve(response);
            } else {
              resolve({});
            }
          })
          .catch(err => reject(err));
      }
    });
  }

  getCapitalData(capital, country, lang) {
    return new Promise(async (resolve, reject) => {
      const key = `${capital}#${country}`;
      const [err, data] = await this.redisClient.getByKey(key);
      if (err) {
        return reject(err);
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
          .then(async res => {
            if (res.results.length > 0) {
              const country = res.results[res.results.length - 1];
              // with this we get the country lat and lng
              const response = {
                latitude: country.geometry.location.lat,
                longitude: country.geometry.location.lng,
                name: country.formatted_address
              };
              // set redis cache in seconds 'EX'
              await this.redisClient.setWithExpiry(key, JSON.stringify(response), this.expiry);
              resolve(response);
            } else {
              resolve({});
            }
          });
      }
    });
  }
}

module.exports = GeoCode;
