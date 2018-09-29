const router = require('express').Router();
const fetch = require('node-fetch');

// Set default API response
const appRouter = (darkskyClient, geocodeClient, restcountriesClient) => {
  // darkskyRequest expose Geocode API and darksky API calls result.
  router.get('/forecast', (req, res) =>
    darkskyRequest(darkskyClient, geocodeClient, restcountriesClient)(req, res)
  );

  return router;
};

const darkskyRequest = (darkskyClient, geocodeClient, restcountriesClient) => async (req, res) => {
  const { latitude, longitude, lang } = req.query;
  // Simulate a random error for current request.
  // If this is the case, we need to retry the request until it wont fail.
  try {
    if (Math.random(0, 1) <= 0.1) {
      console.log('OH MG this is a useless error');
      throw new Error('retryable error');
    }
  } catch (err) {
    return darkskyRequest(darkskyClient, geocodeClient, restcountriesClient)(req, res);
  }

  const response = {};
  let err, countryResult;
  // Get country information, in this case the relevant data is: country name
  [err, countryResult] = await geocodeClient.getCountryData(latitude, longitude, lang);
  if (err) {
    // If this happens its mean that the coords doesn't exists or restcountries doesn't have them.
    res.status(500).json({ error: 'internal server error' });
    return;
  }

  if (!countryResult.hasOwnProperty('name')) {
    res.status(400).json({ error: 'bad request' });
    return;
  }

  // get capital city of the given country
  let geoCapital;
  const country = countryResult.name === 'Estados Unidos' ? 'USA' : countryResult.name;
  [err, geoCapital] = await restcountriesClient.getCountryData(country);
  if (err) {
    // If this happens its mean that the coords doesn't exists or restcountries doesn't have them.
    res.status(500).json({ error: 'internal server error' });
    return;
  }

  if (!geoCapital.hasOwnProperty('capital')) {
    res.status(500).json({ error: 'internal server error' });
    return;
  }

  let geoResult = {};
  // with the capital city get the right location of it.
  if (typeof geoCapital === 'undefined') {
    [err, geoResult] = await geocodeClient.getCapitalData(
      countryResult.name,
      countryResult.name,
      lang
    );
  } else {
    [err, geoResult] = await geocodeClient.getCapitalData(
      countryResult.name,
      geoCapital.capital,
      lang
    );
  }

  if (err) {
    // If this happens its mean that the coords doesn't exists or restcountries doesn't have them.
    res.status(500).json({ error: 'internal server error' });
    return;
  }

  if (!geoResult.hasOwnProperty('name')) {
    res.status(400).json({ error: 'bad request' });
    return;
  }

  Object.assign(response, { ...geoResult });

  let result;
  [err, result] = await darkskyClient.forecast(geoResult.latitude, geoResult.longitude, lang);
  if (err) {
    // If this happens its mean that the coords doesn't exists or darksky doesn't have them.
    res.status(500).json({ error: 'internal server error' });
    return;
  }

  Object.assign(response, { ...result });

  res.json(response);
  return;
};

// Export API routes
module.exports = appRouter;
