const redisLib = require('redis');

class Redis {
  constructor(port, host) {
    this.client = redisLib.createClient(port, host);
  }

  getByKey(key) {
    return new Promise(resolve => {
      this.client.get(key, (err, data) => {
        if (err) {
          return resolve([err, null]);
        }

        return resolve([null, data]);
      });
    });
  }

  setWithExpiry(key, data, expiry) {
    return new Promise(resolve => {
      this.client.set(key, data, 'EX', expiry, (err, data) => {
        if (err) {
          return resolve([err, null]);
        }

        return resolve([null, data]);
      });
    });
  }

  geoAdd(key, lat, lng, value) {
    return new Promise(resolve => {
      this.client.geoadd(key, lat, lng, value, (err, data) => {
        if (err) {
          return resolve([err, null]);
        }

        return resolve([null, data]);
      });
    });
  }

  geoRadius(key, lat, lng) {
    return new Promise(resolve => {
      this.client.georadius(key, lat, lng, 100, 'km', (err, data) => {
        if (err) {
          return resolve([err, null]);
        }

        return resolve([null, data]);
      });
    });
  }
}

module.exports = Redis;
