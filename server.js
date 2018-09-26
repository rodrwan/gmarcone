require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");
const morgan = require("morgan");

const Darksky = require("./darksky/darksky");
const routes = require("./routes/routes");

const { PORT, REDIS_PORT, DARKSKY_TOKEN, CACHE_INTERVAL } = process.env;

const app = express();

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(morgan(":method :url :response-time"));

const redisClient = redis.createClient(REDIS_PORT);
const darkskyClient = new Darksky(DARKSKY_TOKEN, redisClient, CACHE_INTERVAL);
app.use("/api", routes(darkskyClient));

let port = PORT || 8080;
// Launch app to listen to specified port
app.listen(port, function() {
  console.log("Running gMarcone on port " + port);
});
