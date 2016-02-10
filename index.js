/*eslint no-unused-vars: 1*/
"use strict";

let client = require("./src/client");
let server = require("./src/server");

const default_Rsrv_port = 6311;

function connect(hostname, port, connectListener) {
    hostname = hostname !== undefined ? hostname : "localhost";
    port = port !== undefined ? port : default_Rsrv_port;
    connectListener = connectListener !== undefined ? connectListener : function(){};
    
    return new client(hostname, port, connectListener);
}

module.exports = {
    connect: connect,
    Client: client,
    Server: server
};
