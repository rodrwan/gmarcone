const router = require('express').Router();
// Set default API response

const appRouter = (darkskyClient, geocodeClient) => {
  router.get('/forecast', async (req, res) => {
    const { latitude, longitude, lang } = req.query;

    const response = {};
    const geoResult = await geocodeClient.getData(latitude, longitude, lang);
    if (!geoResult.hasOwnProperty('name')) {
      res.status(400).json({ error: 'bad request' });
      return;
    }

    Object.assign(response, { ...geoResult });
    try {
      const result = await darkskyClient.forecast(geoResult.latitude, geoResult.longitude, lang);
      Object.assign(response, { ...result });
    } catch (err) {
      res.status(500).json({ error: 'internal server error' });
      return;
    }

    res.json(response);
  });

  return router;
};

// Export API routes
module.exports = appRouter;
