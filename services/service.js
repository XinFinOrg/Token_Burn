"use strict";
const uuid = require("uuid/v4");
const Web3 = require("web3");
const XDC3 = require("xdc3");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const User = require("../models/merchant");
const Merchant = require("../models/merchant");
const EventLog = require("../models/eventLogs");
const { logger } = require("../services/logger");
const config = require("../config/config");

if (!fs.existsSync(path.join(__dirname, "../config/keyConfig.js"))) {
  logger.error("Please add keyConfig.js file. Exiting. . . ");
  process.exit(1);
}
if (!fs.existsSync(path.join(__dirname, "../config/contractConfig.js"))) {
  logger.error("Please add contractConfig.js file. Exiting. . . ");
  process.exit(1);
}

const keyConfig = config.keyConfig;
const contractConfig = config.contractConfig;
const networkRpc = config.networkRpc;
const networkId = config.networkId;

if (
  _.isEmpty(contractConfig.acceptToken_addr) ||
  _.isEmpty(contractConfig.acceptToken_abi)
) {
  logger.error("Un-initiated files KeyConfig /  ContractConfig. exiting . . .");
  process.exit(1);
}

const errorCode = require("../helpers/errorCode");
const web3 = new Web3(
  new Web3.providers.HttpProvider(networkRpc)
);

const xdc3 = new XDC3(
  new XDC3.providers.HttpProvider(networkRpc)
);

const contractInstWeb3 = new web3.eth.Contract(
  contractConfig.acceptToken_abi,
  "0x" + contractConfig.acceptToken_addr.slice(3)
);

contractInstWeb3.methods
  .owner()
  .call()
  .then(result => {
    logger.info(`[*] The owner address is: ${result}`);
  })
  .catch(e => logger.error(e));

exports.testApi = (req, res) => {
  return res.status(200).json({
    all: "good"
  });
};

// For Merchant
exports.registerNewMerchant = async (req, res) => {
  logger.verbose("called registerNewMerchant at service.registerNewMerchant");
  if (_.isEmpty(req.body)) {
    logger.warn("req.body is empty at service.registerNewMerchant");
    return res.status(422).json({ status: false, error: errorCode[422] });
  }
  if (
    _.isEmpty(req.body.owner) ||
    _.isEmpty(req.body.burnPercent) ||
    _.isEmpty(req.body.merchantName)
  ) {
    logger.warn("missing parameters at service.registerNewMerchant");
    return res.status(422).json({ status: false, error: errorCode[422] });
  }
  let ownerAddress = req.body.owner;
  if (ownerAddress.startsWith("xdc")) {
    ownerAddress = "0x" + ownerAddress.slice(3);
  }
  const merchantName = req.body.merchantName;
  const merchantId = uuid();
  let burnPercent = req.body.burnPercent;
  let clrInterval = null;
  try {
    burnPercent = parseFloat(req.body.burnPercent);
  } catch (e) {
    logger.error(
      "error while converting 'string' to 'float' at service.registerNewMerchant"
    );
    return res.status(400).json({ status: false, error: errorCode[400] });
  }

  if (!xdc3.isAddress(ownerAddress)) {
    logger.error(
      `user ${req.user.email} provided invalid address at service.registerNewMerchant : `,
      ownerAddress
    );
    return res.status(400).json({ status: false, error: errorCode[400] });
  }
  logger.verbose("request validations performed successfully");
  const burnDecimals = req.body.burnPercent.includes(".")
    ? req.body.burnPercent.split(".")[1].length
    : 0;
  const intBurnPercent = parseInt(burnPercent * Math.pow(10, burnDecimals));
  const encodedData = contractInstWeb3.methods
    .addMerchant(
      merchantName,
      merchantId,
      ownerAddress,
      intBurnPercent,
      burnDecimals
    )
    .encodeABI();
  const signed = await signAndSendTx(
    encodedData,
    "0x" + contractConfig.acceptToken_addr.slice(3),
    "0x" + keyConfig.addr.slice(3),
    keyConfig.privateKey,
    networkId
  );
  web3.eth
    .sendSignedTransaction(signed.rawTransaction)
    .once("transactionHash", hash => {
      clrInterval = setInterval(async () => {
        const receipt = xdc3.eth.getTransactionReceipt(hash);
        if (!receipt) {
          // no receipt i.e. tx is removed
          logger.info("No tx found, will wait");
          // return callback(false, "no tx found", null);
        } else if (receipt.blockNumber == null || receipt.blockNumber == 0) {
          // not yet mined
          // continue
        } else if (receipt.status == 1) {
          // ok
          logger.info("receipt received; Hash: ", hash);
          const currDate = Date.now();
          const newMerchant = newDefMerchant(
            req.user.email,
            merchantName,
            merchantId,
            burnPercent,
            burnDecimals,
            currDate,
            hash,
            ownerAddress
          );

          clearInterval(clrInterval);
          try {
            newMerchant.save();
          } catch (e) {
            logger.error(
              "error while saving newMerchant insance at service.registerNewMerchant; "
            );
            logger.error(e.toString());
            // notify the admin about the issue
          }
          logger.info(
            `succcessfully added new merchant for user ${req.user.email}`
          );
          // callback(true, null, ipfsHash[0].hash, hash);
          return res.status(200).json({ status: true, txHash: hash });
        }
      }, 5000);
    })
    .on("receipt", receipt => {
      logger.info(`Receipt: ${receipt.toString()}`);
    })
    .on("error", err => {
      if (!err.toString().includes("Failed to check for transaction receipt")) {
        logger.error("error in transaction execution; ");
        logger.error(err.toString());
        clearInterval(clrInterval);
        return res
          .status(500)
          .json({ status: false, error: errorCode[500], txHash: null });
      }
    });
};

// For Admin
exports.enableMerchant = async (req, res) => {
  logger.verbose("called service.enableMerchant");
  if (_.isEmpty(req.body)) {
    logger.warn("req.body is empty at service.enableMerchant");
    return res.status(422).json({ status: false, error: errorCode[422] });
  }
  if (_.isEmpty(req.body.merchantId)) {
    logger.warn("req.body.merchantId is empty at service.enableMerchant");
    return res.status(422).json({ status: false, error: errorCode[422] });
  }
  const merchantId = req.body.merchantId;
  const merchant = await Merchant.findOne({ merchantId: merchantId });
  let clrInterval = null;
  if (merchant == null) {
    logger.warn("merchant not found at service.enableMerchant");
    return res
      .status(400)
      .json({ status: false, error: "no such merchant exists" });
  }
  if (merchant.status) {
    // already enabled
    logger.warn("merchant is already enabled at service.enableMerchant");
    return res.status(400).json({
      status: false,
      error:
        "already enabled, please contact admin if there are any inconsistencies"
    });
  }
  logger.verbose(
    "validations completed successfully at service.enableMerchant"
  );
  const encodedData = contractInstWeb3.methods
    .enableMerchant(merchantId)
    .encodeABI();
  const signed = await signAndSendTx(
    encodedData,
    "0x" + contractConfig.acceptToken_addr.slice(3),
    "0x" + keyConfig.addr.slice(3),
    keyConfig.privateKey,
    networkId
  );
  web3.eth
    .sendSignedTransaction(signed.rawTransaction)
    .once("transactionHash", hash => {
      clrInterval = setInterval(async () => {
        logger.verbose("interval started at service.enableMerchant");
        const receipt = xdc3.eth.getTransactionReceipt(hash);
        if (!receipt) {
          // no receipt i.e. tx is removed
          logger.info("No tx found, will wait");
          // return callback(false, "no tx found", null);
        } else if (receipt.blockNumber == null || receipt.blockNumber == 0) {
          // not yet mined
          // continue
        } else if (receipt.status == 1) {
          // ok
          logger.verbose(
            "receipt found with status 1 ay service.enableMerchant"
          );
          merchant.status = true;
          clearInterval(clrInterval);
          try {
            merchant.save();
          } catch (e) {
            logger.error(
              "error while saving the merchant instance at service.enableMerchant;error: ",
              e.toString()
            );
            // console.error("Something went wrong: ", e);
            // notify the admin about the issue
          }
          logger.info(`auto-burn for merchant ${merchantId} is now enabled`);
          // callback(true, null, ipfsHash[0].hash, hash);
          return res.status(200).json({ status: true, txHash: hash });
        }
      }, 5000);
    })
    .on("error", err => {
      if (!err.toString().includes("Failed to check for transaction receipt")) {
        logger.error(
          "error occured while executing the transaction at the EVM; error: ",
          err.toString()
        );
        clearInterval(clrInterval);
        return res
          .status(500)
          .json({ status: false, error: errorCode[500], txHash: null });
      }
    });
};

// For Admin
exports.disableMerchant = async (req, res) => {
  logger.info("called service.disableMerchant");
  if (_.isEmpty(req.body)) {
    logger.warn("req.body is empty at service.disableMerchant");
    return res.status(422).json({ status: false, error: errorCode[422] });
  }
  if (_.isEmpty(req.body.merchantId)) {
    logger.warn("req.body.merchantId is empty at service.disableMerchant");
    return res.status(422).json({ status: false, error: errorCode[422] });
  }
  const merchantId = req.body.merchantId;
  const merchant = await Merchant.findOne({ merchantId: merchantId });
  let clrInterval = null;
  if (merchant == null) {
    logger.warn(
      `merchant not found for ID: ${merchantId} at service.disableMerchant`
    );
    return res
      .status(400)
      .json({ status: false, error: "no such merchant exists" });
  }
  if (!merchant.status) {
    // already enabled
    logger.warn(
      `merchant merchant already disabled for ID: ${merchantId} at service.disableMerchant`
    );
    return res.status(400).json({
      status: false,
      error:
        "already disabled, please contact admin if there are any inconsistencies"
    });
  }
  logger.verbose("request validation successful");
  const encodedData = contractInstWeb3.methods
    .disableMerchant(merchantId)
    .encodeABI();
  const signed = await signAndSendTx(
    encodedData,
    "0x" + contractConfig.acceptToken_addr.slice(3),
    "0x" + keyConfig.addr.slice(3),
    keyConfig.privateKey,
    networkId
  );
  web3.eth
    .sendSignedTransaction(signed.rawTransaction)
    .once("transactionHash", hash => {
      clrInterval = setInterval(async () => {
        const receipt = xdc3.eth.getTransactionReceipt(hash);
        if (!receipt) {
          // no receipt i.e. tx is removed
          logger.info("No tx found, will wait");
          // return callback(false, "no tx found", null);
        } else if (receipt.blockNumber == null || receipt.blockNumber == 0) {
          // not yet mined
          // continue
        } else if (receipt.status == 1) {
          // ok
          logger.verbose("receipt received at service.disableMerchant");
          merchant.status = false;
          clearInterval(clrInterval);
          try {
            merchant.save();
          } catch (e) {
            logger.error(
              "error while saving the merchant instance at service.disableMerchant; error: ",
              e.toString()
            );
            // notify the admin about the issue
          }
          logger.info(
            `merchant ${merchantId} is now disabled at service.disableMerchant`
          );
          // callback(true, null, ipfsHash[0].hash, hash);
          return res.status(200).json({ status: true, txHash: hash });
        }
      }, 5000);
    })
    .on("error", err => {
      if (!err.toString().includes("Failed to check for transaction receipt")) {
        logger.error(
          `error during execution of the tx at EVM; error: `,
          err.toString()
        );
        clearInterval(clrInterval);
        return res
          .status(500)
          .json({ status: false, error: errorCode[500], txHash: null });
      }
    });
};

exports.getUserShop = async (req, res) => {
  try {
    if (_.isEmpty(req.user) || _.isEmpty(req.user.email)) {
      return res.json({
        status: -1,
        error: null,
        shops: [],
        message: "no user in the request"
      });
    }
    const userShops = await Merchant.find({ email: req.user.email });
    if (_.isEmpty(userShops)) {
      return res.status(200).json({
        status: 0,
        error: null,
        shops: [],
        message: "no merchant shop registered"
      });
    }
    return res.status(200).json({
      status: 1,
      error: null,
      message: "successfully fecthed the user's shops",
      shops: userShops
    });
  } catch (e) {
    logger.error(`internal error: ${e.toString()}`);
    return res.status(500).json({
      status: -1,
      error: errorCode[500],
      message: "something went wrong while fetching the suer shops"
    });
  }
};

exports.getContractDetails = (req,res) => {
  console.log("called get contract details");
  res.json({status:true, contract:contractConfig});
}

exports.getMerchantPaymentLogs = async (req, res) => {
  logger.verbose(`called services.service.getMerchantPaymentLogs`);
  if (_.isEmpty(req.body) || _.isEmpty(req.body.merchantId)) {
    logger.info(
      `empty requesst body at services.service.getMerchantPaymentLogs`
    );
    return res.status(400).json({
      status: false,
      error: "bad request",
      message: "request body / parameters are missing"
    });
  }
  const user = await User.findOne({ email: req.user.email });
  if (_.isEmpty(user)) {
    logger.info(
      `user not found at services.service.getMerchantPaymentLogs : ${req.user.email}`
    );
    return res.status(400).json({
      status: false,
      error: "bad request",
      message: "user does not exist"
    });
  }
  const merchant = await Merchant.findOne({ merchantId: req.body.merchantId });
  if (_.isEmpty(merchant)) {
    logger.info(
      `merchant not found at services.service.getMerchantPaymentLogs : ${req.body.merchantId}`
    );
    return res.status(400).json({
      status: false,
      error: "bad request",
      message: "merchant does not exist"
    });
  }
  if (req.user.email !== merchant.email) {
    logger.info(
      `user not authorized at services.service.getMerchantPaymentLogs : ${req.user.email}, merchantId: ${req.body.merchantId}`
    );
    return res.status(401).json({
      status: false,
      error: "not authorized",
      message: "not the owner of the shop"
    });
  }
  logger.verbose(
    "request verification successful at services.service.getMerchantPaymentLogs"
  );
  const paymentLogs = await EventLog.find({
    "returnArgs.merchantId": req.body.merchantId
  });
  res.status(200).json({
    status: true,
    error: null,
    message: "successfully fetched the logs",
    logs: paymentLogs
  });
};

function newDefUser() {
  return new User({
    email: "",
    password: "",
    merchantName: "",
    merchantId: "",
    status: true,
    burnPercent: "",
    burnStatus: false,
    created: "",
    lastActive: ""
  });
}

async function signAndSendTx(encodedData, toAddr, fromAddr, privKey, chainId) {
  console.log(web3.currentProvider)
  const estimateGas = await web3.eth.estimateGas({data:encodedData}); // using this throws new error
  const account = web3.eth.accounts.privateKeyToAccount(privKey);
  const rawTx = {
    to: toAddr,
    from: account.address,
    gas: 2000000,
    gasPrice: await web3.eth.getGasPrice(),
    nonce: await web3.eth.getTransactionCount(account.address),
    data: encodedData,
    chainId: chainId+""
  };
  const signed = await web3.eth.accounts.signTransaction(rawTx, privKey);
  return signed;
}

function newDefMerchant(
  merchantEmail,
  merchantName,
  merchantId,
  burnPercent,
  burnDecimals,
  currDate,
  hash,
  owner
) {
  return new Merchant({
    email: merchantEmail,
    merchantName: merchantName,
    merchantId: merchantId,
    status: true,
    owner: owner,
    burnPercent: burnPercent,
    burnDecimals: burnDecimals,
    burnStatus: false,
    created: currDate,
    lastActive: currDate,
    hash: hash
  });
}
