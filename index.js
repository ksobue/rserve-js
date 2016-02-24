/*eslint no-unused-vars: 1*/
"use strict";

const client = require("./src/client");

module.exports = {
    const: require("./src/Rsrv.js"),
    Client: client,
    connect: function(url, cb) {
        return new client(url, cb);
    }
};
