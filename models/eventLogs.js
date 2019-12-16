const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
    event:String,
    logTime:String,
    returnArgs:{},
    txHash: String,
    blockNumber:String,
    blockHash:String
});


module.exports = mongoose.model("EventLog",logSchema);

