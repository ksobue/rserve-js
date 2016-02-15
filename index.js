/*eslint no-unused-vars: 1*/
"use strict";

let client = require("./src/client");

module.exports = {
    Client: client,
    connect: function(hostname, port, cb) {
        return new client(hostname, port, cb);
    }
};
