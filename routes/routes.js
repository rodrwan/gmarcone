const router = require("express").Router();
// Set default API response

const appRouter = darkskyClient => {
  router.get("/forecast", async (req, res) => {
    const { latitude, longitude, lang } = req.query;

    const result = await darkskyClient.forecast(latitude, longitude, lang);

    res.json(result);
  });

  return router;
};

// Export API routes
module.exports = appRouter;
