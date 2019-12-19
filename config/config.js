"use strict";
const argv = require("yargs").argv;
const _ = require("lodash");
const { logger } = require("../services/logger");
const contractConfig = require("./contractConfig");
const keyConfig = require("./keyConfig");
const networkLevels = ["apothem", "mainnet"];

let network  = "apothem";
const apothemRpc = "http://rpc.apothem.network";
const apothemId = "51";
const mainnetRpc = "http://rpc.xinfin.network";
const mainnetId = "50";

if (_.isEmpty(argv) || _.isEmpty(argv["network"])) {
  logger.info('[*] no network specified, using "apothem" as default');
} else {
  if (networkLevels.includes(argv["network"])) {
    network = argv["network"];
    logger.info(`[*] switched to network ${argv['network']}`);
  } else {
    logger.info('[*] unknown network, using "apothem" as default');
  }
}

switch(network) {
    case "apothem": {
        if (_.isEmpty(contractConfig.apothem) || _.isEmpty(keyConfig.apothem) || _.isEmpty(keyConfig.apothem.addr) || _.isEmpty(keyConfig.apothem.privateKey) || _.isEmpty(contractConfig.apothem.acceptToken_abi) || _.isEmpty(contractConfig.apothem.acceptToken_addr)){
            logger.error("[*] missing configuration for network 'apothem'");
            logger.error("[*] Exiting . . .");
            process.exit(1);
        }else {
            exports.contractConfig = contractConfig.apothem;
            exports.keyConfig = keyConfig.apothem;
            exports.networkRpc = apothemRpc;
            exports.networkId = apothemId;
        }
        break;
    }
    case "mainnet" : {
        if (_.isEmpty(contractConfig.mainnet) || _.isEmpty(keyConfig.mainnet) || _.isEmpty(keyConfig.mainnet.addr) || _.isEmpty(keyConfig.mainnet.privateKey) || _.isEmpty(contractConfig.mainnet.acceptToken_abi) || _.isEmpty(contractConfig.mainnet.acceptToken_addr)) {
            logger.error("[*] missing configuration for network 'mainnet'");
            logger.error("[*] Exiting . . .");
            process.exit(1);
        } else {
            exports.contractConfig = contractConfig.mainnet;
            exports.keyConfig = keyConfig.mainnet
            exports.networkRpc = mainnetRpc;
            exports.networkId = mainnetId;
        }
        break;
    }
    default : {
        logger.error(`[*] unrecognized network: ${argv['network']}`);
        break;
    }
}
