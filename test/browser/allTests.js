"use strict";

require("../normalCommandsTest") (
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

require("../controlCommandsTest") (
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

require("../loginCommandTest") (
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
            "pwdfile": "../conf/password.txt",
            "rsa.key": "../conf/server.key",      // for CMD_keyReq and CMD_secLogin
            "switch.qap.tls": "enable",           // for CMD_switch
            "tls.key": "../conf/server.key",      // for CMD_switch
            "tls.cert": "../conf/server.csr"      // for CMD_switch
        }
    }
);
