/* Connect to Mongo DB */
var db = require('promised-mongo')(process.env.MONGODB || 'permanentiefiches');

exports.db = function () {
  return db;
};
