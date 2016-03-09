"use strict";

require("./normalCommandsTest") (
    {
        "title": "QAP1 over TCP/IP",
        "url": "tcp://localhost:6312",
        "config": {
            "port": 6312,
            "control": "enable"
        }
    }
);

require("./controlCommandsTest") (
    {
        "title": "QAP1 over TCP/IP",
        "url": "tcp://localhost:6312",
        "config": {
            "qap.port": 6312,
            "control": "enable"
        }
    }
);

require("./loginCommandTest") (
    {
        "title": "QAP1 over TCP/IP",
        "url": "tcp://localhost:6312",
        "config": {
            "qap.port": 6312,
            "qap.tls.port": 6313,
            "auth": "required",
            "plaintext": "enabled",
            "pwdfile": __dirname + "/conf/password.txt",
            "rsa.key": __dirname + "/conf/server.key",      // for CMD_keyReq and CMD_secLogin
            "switch.qap.tls": "enable",                     // for CMD_switch
            "tls.key": __dirname + "/conf/server.key",      // for CMD_switch
            "tls.cert": __dirname + "/conf/server.csr"      // for CMD_switch
        }
    }
);

require("./normalCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap.port": 6312,
            "websockets": "enable",
            "websockets.port": 8081,
            "oob": "enable",
            "control": "enable"
        }
    }
);

require("./controlCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap.port": 6312,
            "websockets": "enable",
            "websockets.port": 8081,
            "oob": "enable",
            "control": "enable"
        }
    }
);

require("./loginCommandTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap.port": 6312,
            "websockets": "enable",
            "websockets.port": 8081,
            "oob": "enable",
            "auth": "required",
            "plaintext": "enabled",
            "pwdfile": __dirname + "/conf/password.txt",
            "rsa.key": __dirname + "/conf/server.key",      // for CMD_keyReq and CMD_secLogin
            "switch.qap.tls": "enable",                     // for CMD_switch
            "tls.key": __dirname + "/conf/server.key",      // for CMD_switch
            "tls.cert": __dirname + "/conf/server.csr"      // for CMD_switch
        }
    }
);
