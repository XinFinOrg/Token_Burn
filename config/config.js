"use strict";
const argv = require("yargs").argv;
const _ = require("lodash");
const { logger } = require("../services/logger");
const contractConfig = require("./contractConfig");
const keyConfig = require("./keyConfig");
const networkLevels = ["apothem", "xinfin"];

let network  = "apothem";

if (_.isEmpty(argv) || _.isEmpty(argv["network"])) {
  logger.info('[*] no network specified, using "apothem" as default');
} else {
  if (networkLevels.includes(argv["network"])) {
    network = argv["network"];
    logger.info(`[*] switched to network ${argv['network']}`);
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
        }
        break;
    }
    case "xinfin" : {
        if (_.isEmpty(contractConfig.xinfin) || _.isEmpty(keyConfig.xinfin) || _.isEmpty(keyConfig.xinfin.addr) || _.isEmpty(keyConfig.xinfin.privateKey) || _.isEmpty(contractConfig.xinfin.acceptToken_abi) || _.isEmpty(contractConfig.xinfin.acceptToken_addr)) {
            logger.error("[*] missing configuration for network 'xinfin'");
            logger.error("[*] Exiting . . .");
            process.exit(1);
        } else {
            exports.contractConfig = contractConfig.xinfin;
            exports.keyConfig = keyConfig.xinfin;
        }
        break;
    }
    default : {
        logger.error(`[*] unrecognized network: ${argv['network']}`);
        break;
    }
}
