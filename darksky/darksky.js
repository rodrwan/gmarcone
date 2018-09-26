const fetch = require("node-fetch");

const BASE_API_URL = `https://api.darksky.net/forecast`;
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
          console.log("in cache");
          resolve(JSON.parse(data));
        } else {
          console.log("not in cache");
          const URL = `${BASE_API_URL}/${
            this.bearer
          }/${latitude},${longitude}?lang=${lang}&exclude=minutely,hourly,alerts&units=si`;
          fetch(URL)
            .then(res => {
              console.log(
                "X-Forecast-API-Calls",
                res.headers.get("X-Forecast-API-Calls")
              );
              return res.json();
            })
            .then(res => {
              // set redis cache in seconds 'EX'
              this.redisClient.set(key, JSON.stringify(res), "EX", this.expiry);
              resolve(res);
            });
        }
      });
    });
  }
}

module.exports = Darksky;
