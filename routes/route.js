const service = require("../services/service");
const requireLogin = require("../middleware/requireLogin");
const requireAdmin = require("../middleware/requireAdmin");

module.exports = app => {
  app.post("/api/registerMerchant",requireLogin,service.registerNewMerchant);
  app.post("/api/enableMerchant",requireAdmin,service.enableMerchant);
  app.post("/api/disableMerchant",requireAdmin,service.disableMerchant);
  app.get("/api/getuserShop",service.getUserShop);
  app.get("/api/getContractDetails",service.getContractDetails);
  app.post("/logger/getMerchantPaymentLogs",requireLogin,service.getMerchantPaymentLogs);
};
