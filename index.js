"use strict";
const express = require("express");
const mongoose = require("mongoose");
const XDC3 = require("xdc3");
const EventLog = require("./models/eventLogs");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");
const redis = require("redis");
const redisClient = redis.createClient({host:process.env.REDIS_HOST || "localhost",port:6379});
const redisStore = require("connect-redis")(session);
const path = require("path");
const fs = require("fs");
const config = require("./config/config");

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

app.use("/index",express.static(path.join(__dirname, "./index.html")));


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

const xdc3 = new XDC3(new XDC3.providers.HttpProvider(config.networkRpc));

const contractConfig = config.contractConfig;
const contractInst = xdc3.eth
  .contract(contractConfig.acceptToken_abi)
  .at(contractConfig.acceptToken_addr);

logger.info(`[*] From the XDC3 instance (index.js), owner is: ${contractInst.owner()}`);

const eventContractOwnerChange = contractInst.OwnershipTransferred();
const eventNewMerchant = contractInst.NewMerchant();
const eventNewPayment = contractInst.NewPayment();
const eventOwnershipTransfer = contractInst.MerchantOwnerChanged();

eventContractOwnerChange.watch(async (err, result) => {
  logger.info("received event at index.eventContractOwnerChange");
  if (err !== null) {
    // do error handling
    logger.error(`error at index.eventContractOwnerChange : ${err.toString()}`);
  } else {
    // ok
    logger.verbose(
      "successfully received the event at index.eventContractOwnerChange"
    );
    const newEvent = EventLog({
      event: result.event,
      logTime: Date.now(),
      returnArgs: result.args,
      txHash: result.transactionHash,
      blockHash: result.blockHash,
      blockNumber: result.blockNumber
    });
    try {
      await newEvent.save();
      logger.verbose("new event saved to the db");
    } catch (e) {
      logger.error(
        `error while saving the new event instance at index.eventContractOwnerChange: ${e.toString()}`
      );
    }
  }
});

eventNewMerchant.watch(async (err, result) => {
  logger.info("received event at index.eventNewMerchant");
  if (err !== null) {
    // do error handling
    logger.error(`error at index.eventNewMerchant : ${err.toString()}`);
  } else {
    // ok
    logger.verbose("successfully received new event at index.eventNewMerchant");
    const newEvent = EventLog({
      event: result.event,
      logTime: Date.now(),
      returnArgs: result.args,
      txHash: result.transactionHash,
      blockHash: result.blockHash,
      blockNumber: result.blockNumber
    });
    try {
      await newEvent.save();
      logger.verbose(`new event saved to the db`);
    } catch (e) {
      logger.error(
        `error occured while saving the new event instance at index.eventNewMerchant: ${e.toString()}`
      );
    }
  }
});

eventNewPayment.watch(async (err, result) => {
  logger.info("received event at index.eventNewPayment");
  if (err !== null) {
    // do error handling
    logger.error(`error at index.eventNewPayment : ${err.toString()}`);
  } else {
    // ok
    logger.verbose("successfully received new event at index.eventNewPayment");
    const newEvent = EventLog({
      event: result.event,
      logTime: Date.now(),
      returnArgs: result.args,
      txHash: result.transactionHash,
      blockHash: result.blockHash,
      blockNumber: result.blockNumber
    });
    try {
      await newEvent.save();
      logger.verbose(`new event saved to the db`);
    } catch (e) {
      logger.error(
        `error occured while saving the new event instance at index.eventNewPayment: ${e.toString()}`
      );
    }
  }
});

eventOwnershipTransfer.watch(async (err, result) => {
  logger.info("received event at index.eventOwnershipTransfer");
  if (err !== null) {
    // do error handling
    logger.error(`error at index.eventOwnershipTransfer : ${err.toString()}`);
  } else {
    // ok
    logger.verbose(
      "successfully received new event at index.eventOwnershipTransfer"
    );
    const newEvent = EventLog({
      event: result.event,
      logTime: Date.now(),
      returnArgs: result.args,
      txHash: result.transactionHash,
      blockHash: result.blockHash,
      blockNumber: result.blockNumber
    });
    try {
      await newEvent.save();
      logger.verbose(`new event saved to the db`);
    } catch (e) {
      logger.error(
        `error occured while saving the new event instance at index.eventOwnershipTransfer: ${e.toString()}`
      );
    }
  }
});
