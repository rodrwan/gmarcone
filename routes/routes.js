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
  // Simulate a random approach for request error.
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
  // Get country information, in this case the relevant data is: country name
  const countryResult = await geocodeClient.getCountryData(latitude, longitude, lang);
  if (!countryResult.hasOwnProperty('name')) {
    res.status(400).json({ error: 'bad request' });
    return;
  }
  // get capital city of the given country
  try {
    geoCapital = await restcountriesClient.getCountryData(countryResult.name);
  } catch (err) {
    // If this happens its mean that the coords doesn't exists or darksky doesn't have them.
    res.status(500).json({ error: 'internal server error' });
    return;
  }

  // with the capital city get the right location of it.
  const geoResult = await geocodeClient.getCapitalData(
    countryResult.name,
    geoCapital.capital,
    lang
  );

  if (!geoResult.hasOwnProperty('name')) {
    res.status(400).json({ error: 'bad request' });
    return;
  }

  Object.assign(response, { ...geoResult });
  try {
    const result = await darkskyClient.forecast(geoResult.latitude, geoResult.longitude, lang);
    Object.assign(response, { ...result });
  } catch (err) {
    // If this happens its mean that the coords doesn't exists or darksky doesn't have them.
    res.status(500).json({ error: 'internal server error' });
    return;
  }

  res.json(response);
  return;
};

// Export API routes
module.exports = appRouter;
