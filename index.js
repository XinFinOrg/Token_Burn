"use strict";
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const redis = require("redis");
const redisClient = redis.createClient({host:process.env.REDIS_HOST || "localhost",port:6379});
const redisStore = require("connect-redis")(session);
const path = require("path");
const fs = require("fs");

const { logger } = require("./services/logger");

const mongoUri =
  process.env.MONGO_DB_URI || "mongodb://localhost:27017/payment-intermediary";
const buildPath = "./client/build";
connectToMongoDB();

redisClient.on("error", err => {
  logger.error("Redis error: ", err);
});

logger.info("[*] Build exists:", fs.existsSync("./client/build"));

const app = express();

if (process.env.ENV == "dev") {
  logger.info("[*] Started the app in DEV mode");
} else if (process.env.ENV == "prod") {
  logger.info("[*] Started the app in PROD mode");
  if (!fs.existsSync(buildPath)) {
    logger.error(
      "[*] Client is not built, please run `npm run build` in ./client"
    );
    logger.verbose("[*] Exiting . . .");
    process.exit(1);
  } else {
    logger.info("[*] Using build");
    app.use(express.static(path.join(__dirname, "./client/build")));
  }
} else {
  // logger.info("[*] unknown mode, defaulting to DEV");
  logger.info("[*] Using build");
  app.use(express.static(path.join(__dirname, "./client/build")));
}

app.use(
  session({
    secret: "test",
    resave: true,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 10800000
    },
    store: new redisStore({
      host: process.env.REDIS_HOST || "localhost",
      port: 6379,
      client: redisClient,
      ttl: 10800000
    })
  })
); // session secret

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(morgan("dev", { stream: logger.stream }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname));

require("./services/passport")(passport);
require("./routes/route")(app);
require("./routes/authRoute")(app);

app.listen(3100, () => logger.info("[*] server started"));

function connectToMongoDB() {
  mongoose
    .connect(
      mongoUri,
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
      err => {
        if (err) {
          logger.error(err);
          throw new Error(JSON.stringify(err));
        } else {
          logger.info(`[*] Connected to Mongo DB at: ${mongoUri}`);
          return;
        }
      }
    )
    .catch(e => {
      logger.error(e);
      logger.error("[*] Error occured: retrying in 5 seconds . . .");
      setTimeout(connectToMongoDB, 5000);
    });
}
