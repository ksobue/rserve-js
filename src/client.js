/*eslint no-unused-vars: 1*/
"use strict";

const EventEmitter = require("events");
const Buffers = require("buffers");
const unixCrypt = require("unix-crypt-td-js");
const crypto = require("crypto");
const NodeRSA = require("node-rsa");

const _ = require("./Rsrv");
const network = require("./net_node");
const decodeMessage = require("./QAP1_decode");
const encodeMessage = require("./QAP1_encode");
const errorMessage = require("./error");
const simplifySEXP = require("./util").simplifySEXP;


class RserveClient extends EventEmitter {
    
    constructor(url, connectListener) {
        super();
        
        this.on("connect", connectListener);
        
        let client = network.connect(url);
        
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
                        if (req.command === _.CMD_readFile || req.command === _.CMD_keyReq) {
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
    
    login(username, password, cb) {
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
            auth = unixCrypt(password, salt);
            
        } else if (this.info.indexOf("ARpt") !== -1) { // plain text
            auth = password;
            
        } else {
            cb(new Error("Unsupported authentication method."));
            return;
        }
        
        this.sendMessage({
            command: _.CMD_login,
            params: [{
                type: _.DT_STRING,
                value: username + "\n" + auth
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

    switch(protocol, cb) {
        // Only "TLS" is supported.
        this.sendMessage({
            command: _.CMD_switch,
            params: [{
                type: _.DT_STRING,
                value: protocol
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

    keyReq(authType, cb) {
        // Only "rsa-authkey" is supported.
        this.sendMessage({
            command: _.CMD_keyReq,
            params: [{
                type: _.DT_STRING,
                value: authType
            }]
        },
        function(err, msg) {
            if (err) {
                cb(err);
                return;
            }
            
            let buffer = msg.params[0];
            
            let authKeyLength = buffer.readInt32LE(0);
            let authKey = buffer.slice(4, 4 + authKeyLength);
            
            let publicKeyLength = buffer.readInt32LE(4 + authKeyLength);
            let publicKeyDer = buffer.slice(4 + authKeyLength + 4, 4 + authKeyLength + 4 + publicKeyLength);
            
            cb(null, authKey, publicKeyDer);
        });
    }

    secLogin(authKey, publicKeyDer, username, password, cb) {
        
        let credential = Buffer.concat([new Buffer(username + "\n" + password, "utf8"), new Buffer([0x00])]);
        
        let buffer = new Buffer(4 + authKey.length + 4 + credential.length);
        buffer.writeInt32LE(authKey.length, 0);
        authKey.copy(buffer, 4);
        buffer.writeInt32LE(credential.length, 4 + authKey.length);
        credential.copy(buffer, 4 + authKey.length + 4);
        
        // https://github.com/s-u/Rserve/issues/60
        let rsaPublicKey = new NodeRSA();
        rsaPublicKey.importKey(publicKeyDer, "pkcs1-public-der");
        let publicKeyPem = rsaPublicKey.exportKey("pkcs8-public-pem");
        let sliceSize = rsaPublicKey.getMaxMessageSize();
        
        let encryptedBufferSlices = [];
        let slices = Math.ceil(buffer.length / sliceSize);
        for (let i = 0; i < slices; i++) {
            let slicedBuffer = buffer.slice(i * sliceSize, i < slices - 1 ? (i + 1) * sliceSize : buffer.length);
            let encryptedBufferSlice = crypto.publicEncrypt(publicKeyPem, slicedBuffer);
            encryptedBufferSlices.push(encryptedBufferSlice);
        }
        let encryptedBuffer = Buffer.concat(encryptedBufferSlices);
        
        this.sendMessage({
            command: _.CMD_secLogin,
            params: [{
                type: _.DT_BYTESTREAM,
                value: encryptedBuffer
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

    ctrlEval(str, cb) {
        this.sendMessage({
            command: _.CMD_ctrlEval,
            params: [
                {
                    type: _.DT_STRING,
                    value: str
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

    ctrlSource(filePath, cb) {
        this.sendMessage({
            command: _.CMD_ctrlSource,
            params: [
                {
                    type: _.DT_STRING,
                    value: filePath
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
