/*eslint no-unused-vars: 1*/
"use strict";

const EventEmitter = require("events");
const url = require("url");
//const net = require("./net-ws");
const Buffers = require("buffers");
const unixCrypt = require("unix-crypt-td-js");

const _ = require("./Rsrv");
const decodeMessage = require("./QAP1_decode");
const encodeMessage = require("./QAP1_encode");
const errorMessage = require("./error");
const simplifySEXP = require("./util").simplifySEXP;


class RserveClient extends EventEmitter {
    
    constructor(rserveUrlStr, connectListener) {
        super();
        
        let rserveUrl = url.parse(rserveUrlStr);
        let protocol = rserveUrl.protocol;
        let hostname = rserveUrl.hostname;
        let port = rserveUrl.port;
        let net = require("net");
        
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
                    
                    let loginRequired = this.info.some(function(info) {
                        return info.startsWith("AR");
                    });
                    this.emit("connect", loginRequired);
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
        
        this.sendMessage = function(req, cb) {
            let writeBuffer = encodeMessage(req);
            client.write(writeBuffer);
            
            handler = function() {
                if (readBuffers.length >= 16) {
                    let headerBuffer = readBuffers.slice(0, 16);
                    let _command = headerBuffer.readInt32LE(0);
                    let length_0_31 = headerBuffer.readInt32LE(4);
                    let _messageId = headerBuffer.readInt32LE(8);
                    let length_32_63 = headerBuffer.readInt32LE(12);
                    
                    let length = length_32_63 * Math.pow(2, 32) + length_0_31;
                    if (length > Number.MAX_SAFE_INTEGER) { // 8191 peta bytes
                        throw new Error("Incoming message data is too large to be handled in JavaScript. (" + length + "bytes)");
                    }
                    
                    if (readBuffers.length >= 16 + length) {
                        let buffer = readBuffers.splice(0, 16 + length).slice();
                        
                        // Rserve bug: CMD_readFile response is not encoded as DT_bytestream
                        // https://github.com/s-u/Rserve/issues/15
                        if (req.command === _.CMD_readFile) {
                            let fixedBuffer = new Buffer(buffer.length + 1 + 3);
                            // header with correct message size
                            buffer.copy(fixedBuffer, 0, 0, 16);
                            fixedBuffer.writeInt32LE(fixedBuffer.length - 16, 4);
                            // param header which was missing
                            fixedBuffer.writeInt8(_.DT_BYTESTREAM, 16);
                            fixedBuffer.writeIntLE(buffer.length - 16, 16 + 1, 3);
                            // param data (byte array)
                            buffer.copy(fixedBuffer, 16 + 1 + 3, 16);
                            buffer = fixedBuffer;
                        }
                        
                        let resp = decodeMessage(buffer);
                        if ((resp.command & _.RESP_OK) !== _.RESP_OK) {
                            let statusCode = _.CMD_STAT(resp.command);
                            cb(new Error(errorMessage(statusCode)), resp.params);
                            return;
                        }
                        
                        cb(null, resp);
                    }
                }
            };
        };
        
        this.close = function() {
            handler = function(){};
            client.end();
        };
    }
    
    login(name, pswd, cb) {
        let auth;
        if (this.info.indexOf("ARuc") !== -1) { // unix crypt
            let key = this.info.filter(function(info) {
                return info.startsWith("K");
            })[0];
            if (key === undefined) {
                cb(new Error("Key for unix crypt was not provided."));
                return;
            }
            
            let salt = key.substring(1, 3);
            auth = unixCrypt(pswd, salt);
            
        } else if (this.info.indexOf("ARpt") !== -1) { // plain text
            auth = pswd;
            
        } else {
            cb(new Error("Unsupported authentication method."));
            return;
        }
        
        this.sendMessage({
            command: _.CMD_login,
            params: [{
                type: _.DT_STRING,
                value: name + "\n" + auth
            }]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }

    voidEval(strOrSexp, cb) {
        this.sendMessage({
            command: _.CMD_voidEval,
            params: [{
                type: typeof strOrSexp === "string" ? _.DT_STRING : _.DT_SEXP,
                value: strOrSexp
            }]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }

    eval(strOrSexp, cb) {
        this.sendMessage({
            command: _.CMD_eval,
            params: [{
                type: typeof strOrSexp === "string" ? _.DT_STRING : _.DT_SEXP,
                value: strOrSexp
            }]
        },
        function(err, msg) {
            if (err) {
                cb(err);
                return;
            }
            
            let sexp = msg.params[0];
            let jsObj = simplifySEXP(sexp);
            cb(null, jsObj, sexp);
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
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
                
            cb(null);
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

    openFile(fileName, cb) {
        this.sendMessage({
            command: _.CMD_openFile,
            params: [{
                type: _.DT_STRING,
                value: fileName
            }]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }

    createFile(fileName, cb) {
        this.sendMessage({
            command: _.CMD_createFile,
            params: [{
                type: _.DT_STRING,
                value: fileName
            }]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }

    closeFile(cb) {
        this.sendMessage({
            command: _.CMD_closeFile,
            params: []
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }

    readFile(size, cb) {
        let params = [];
        
        if (size !== null) {
            params.push({
                type: _.DT_INT,
                value: size
            });
        }
        
        this.sendMessage({
            command: _.CMD_readFile,
            params: params
        },
        function(err, msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null, msg.params[0]);
        });
    }

    writeFile(buffer, cb) {
        this.sendMessage({
            command: _.CMD_writeFile,
            params: [{
                type: _.DT_BYTESTREAM,
                value: buffer
            }]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }

    removeFile(fileName, cb) {
        this.sendMessage({
            command: _.CMD_removeFile,
            params: [{
                type: _.DT_STRING,
                value: fileName
            }]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }

    setSEXP(name, sexp, cb) {
        this.sendMessage({
            command: _.CMD_setSEXP,
            params: [
                {
                    type: _.DT_STRING,
                    value: name
                },
                {
                    type: _.DT_SEXP,
                    value: sexp
                }
            ]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }

    assignSEXP(name, sexp, cb) {
        this.sendMessage({
            command: _.CMD_assignSEXP,
            params: [
                {
                    type: _.DT_STRING,
                    value: name
                },
                {
                    type: _.DT_SEXP,
                    value: sexp
                }
            ]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
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
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }
    
    setBufferSize(bufferSize, cb) {
        this.sendMessage({
            command: _.CMD_setBufferSize,
            params: [
                {
                    type: _.DT_INT,
                    value: bufferSize
                }
            ]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
        });
    }
    
    setEncoding(encoding, cb) {
        if (encoding === "latin1") {
            cb(new Error("'rserve-js' only support UTF8 encoding."));
            return;
        }
        
        this.sendMessage({
            command: _.CMD_setEncoding,
            params: [
                {
                    type: _.DT_STRING,
                    value: encoding
                }
            ]
        },
        function(err, _msg) {
            if (err) {
                cb(err);
                return;
            }
            
            cb(null);
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
        attr = attr.replace(/\r\n/g, "").replace(/\-/g, "");
        if (attr !== "") {
            attrs.push(attr);
        }
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
