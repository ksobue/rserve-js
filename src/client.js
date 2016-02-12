/*eslint no-unused-vars: 1*/
"use strict";

let EventEmitter = require("events");
let net = require("net");
let Buffers = require("buffers");

let _ = require("./Rsrv");
let decodeMessage = require("./QAP1_decode");
let encodeMessage = require("./QAP1_encode");
let errorMessage = require("./error");


class RserveClient extends EventEmitter {
    
    constructor(hostname, port, connectListener) {
        super();
        
        this.on("connect", connectListener);
        
        let client = net.connect(port, hostname);
        
        client.on("error", function(err) {
            this.emit("error", err);
        }.bind(this));
        
        client.on("timeout", function() {
            this.emit("timeout");
        });
        
        let handler = function() {
            if (readBuffers.length >= 32) {
                let idString = readBuffers.splice(0,32);
                try {
                    this.info = decodeServerCapability(idString);
                    this.emit("connect");
                } catch (err) {
                    this.emit("error", err);
                }
            }
        }.bind(this);
        
        let readBuffers = new Buffers();
        client.on("data", function(data) {
            readBuffers.push(data);
            handler();
        });
        
        this.sendMessage = function(msg, cb) {
            let writeBuffer = encodeMessage(msg);
            client.write(writeBuffer);
            
            handler = function() {
                if (readBuffers.length >= 16) {
                    let headerBuffer = readBuffers.slice(0, 16);
                    let command = headerBuffer.readInt32LE(0);
                    let length_0_31 = headerBuffer.readInt32LE(4);
                    let messageId = headerBuffer.readInt32LE(8);
                    let length_32_63 = headerBuffer.readInt32LE(12);
                    
                    let length = length_32_63 * Math.pow(2, 32) + length_0_31;
                    if (length > Number.MAX_SAFE_INTEGER) { // 8191 peta bytes
                        throw new Error("Incoming message data is too large to be handled in JavaScript. (" + length + "bytes)");
                    }
                    
                    if (readBuffers.length >= 16 + length) {
                        let buffer = readBuffers.splice(0, 16 + length).slice();
                        try {
                            let msg = decodeMessage(buffer);
                            if ((msg.command & _.RESP_OK) !== _.RESP_OK) {
                                let statusCode = _.CMD_STAT(msg.command);
                                cb(new Error(errorMessage(statusCode)), msg.params);
                            }
                            
                            cb(null, msg);
                        } catch (err) {
                            cb(new Error("Could not decode message from Rserve. \n" + err));
                        }
                    }
                }
            };
        };
        
        this.close = function() {
            client.end();
        };
    }
    
    login(_name, _pswd) {
        
    }

    voidEval(_name, _pswd) {
        
    }

    eval(str, cb) {
        this.sendMessage({
            command: _.CMD_eval,
            params: [{
                type: _.DT_STRING,
                value: str
            }]
        },
        function(err, msg) {
            if (err) {
                cb(err);
                return;
            }
                
            cb(null, msg.params);
        });
    }

    shutdown(adminPswd, cb) {
        let params = [];
        
        if (adminPswd !== null) {
            params.push({
                type: _.DT_STRING,
                value: adminPswd
            });
        }
        
        this.sendMessage({
            command: _.CMD_shutdown,
            params: params
        },
        function(err, msg) {
            if (err) {
                cb(err);
                return;
            }
                
            cb(null, msg.params);
        });
    }

    switch(_protocol) {
        
    }

    keyReq(_request, _key) {
        
    }

    secLogin(_encryptedAuth) {
        
    }

    ocCall(_sexp) {
        
    }

    ocInit(_sexp) {
        
    }

    openFile(_fn) {
        
    }

    createFile(_fn) {
        
    }

    closeFile() {
        
    }

    readFile(_size, _data) {
        
    }

    writeFile(_data) {
        
    }

    removeFile(_fn) {
        
    }

    setSEXP(_name, _sexp) {
        
    }

    assignSEXP(_name, _sexp) {
        
    }

    detachSession(_sessionKey) {
        
    }

    detachedVoidEval(_sessionKey) {
        
    }

    attachSession(_sessionKey) {
        
    }

    ctrlEval(_str) {
        
    }

    ctrlSource(_str) {
        
    }

    ctrlShutdown(cb) {
        this.sendMessage({
            command: _.CMD_ctrlShutdown,
            params: []
        },
        function(err, msg) {
            if (err) {
                cb(err);
                return;
            }
                
            cb(null, msg.params);
        });
    }

    close() {
        this.client.end();
    }
}



function decodeServerCapability(buffer) {
    let attrs = [];
    for (let i = 0; i < buffer.length; i+= 4) {
        let attr = buffer.toString("utf8", i, i + 4);
        
        if (attr === "\r\n\r\n") {
            break;
        }
        
        attr = attr.replace(/\r\n/g, "").replace(/\-/g, "");
        
        attrs.push(attr);
    }
    
    let idSignature = attrs[0];
    if (idSignature !== "Rsrv") { // R-server ID signature
        throw new Error("Not talking to Rserve.");
    }
    let rServeProtocolVer = attrs[1];
    if (rServeProtocolVer !== "0103") { // version of the R server protocol
        throw new Error("Unsupported protocol version: " + rServeProtocolVer);
    }
    let communicationProtocol = attrs[2];
    if (communicationProtocol !== "QAP1") { // protocol used for communication (here Quad Attributes Packets v1)
        throw new Error("Unsupported communication protocol: " + communicationProtocol);
    }
    
    return attrs;
}

module.exports = RserveClient;
