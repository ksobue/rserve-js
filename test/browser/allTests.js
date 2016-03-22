"use strict";

require("../normalCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap": "disabled",
            "websockets": "enabled",
            "websockets.port": 8081,
            "control": "enabled"
        }
    }
);

require("../controlCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap": "disabled",
            "websockets": "enabled",
            "websockets.port": 8081,
            "control": "enabled"
        }
    }
);

require("../loginCommandTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap": "disabled",
            "websockets": "enabled",
            "websockets.port": 8081,
            "auth": "required",
            "plaintext": "enabled",
            "pwdfile": "../conf/password.txt",
            "rsa.key": "../conf/server.key",      // for CMD_keyReq and CMD_secLogin
            "switch.qap.tls": "enabled",          // for CMD_switch
            "tls.key": "../conf/server.key",      // for CMD_switch
            "tls.cert": "../conf/server.csr"      // for CMD_switch
        }
    }
);

require("../ocCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap": "disabled",
            "websockets": "enabled",
            "websockets.port": 8081,
            "control": "enabled",
            "websockets.qap.oc": "enabled",
            "source": "../conf/oc.init.R"
        }
    }
);
