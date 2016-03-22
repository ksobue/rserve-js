"use strict";

require("./normalCommandsTest") (
    {
        "title": "QAP1 over TCP/IP",
        "url": "tcp://localhost:6312",
        "config": {
            "port": 6312,
            "control": true
        }
    }
);

require("./controlCommandsTest") (
    {
        "title": "QAP1 over TCP/IP",
        "url": "tcp://localhost:6312",
        "config": {
            "qap.port": 6312,
            "control": "enabled"
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
            "switch.qap.tls": "enabled",                    // for CMD_switch
            "tls.key": __dirname + "/conf/server.key",      // for CMD_switch
            "tls.cert": __dirname + "/conf/server.csr"      // for CMD_switch
        }
    }
);

require("./ocCommandsTest") (
    {
        "title": "QAP1 over TCP/IP",
        "url": "tcp://localhost:6312",
        "config": {
            "qap.port": 6312,
            "qap.oc": "enabled",
            "source": __dirname + "/conf/oc.init.R"
        }
    }
);

require("./normalCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap": "disable",
            "websockets": "enabled",
            "websockets.port": 8081,
            "control": "enabled"
        }
    }
);

require("./controlCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap": "disable",
            "websockets": "enabled",
            "websockets.port": 8081,
            "control": "enabled"
        }
    }
);

require("./loginCommandTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap": "disable",
            "websockets": "enabled",
            "websockets.port": 8081,
            "auth": "required",
            "plaintext": "enabled",
            "pwdfile": __dirname + "/conf/password.txt",
            "rsa.key": __dirname + "/conf/server.key",      // for CMD_keyReq and CMD_secLogin
            "switch.qap.tls": "enabled",                    // for CMD_switch
            "tls.key": __dirname + "/conf/server.key",      // for CMD_switch
            "tls.cert": __dirname + "/conf/server.csr"      // for CMD_switch
        }
    }
);

require("./ocCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "qap": "disable",
            "websockets": "enabled",
            "websockets.port": 8081,
            "control": "enabled",
            "websockets.qap.oc": "enabled",
            "source": __dirname + "/conf/oc.init.R"
        }
    }
);
