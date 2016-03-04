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
            "port": 6312,
            "control": "enable"
        }
    }
);

require("./loginCommandTest") (
    {
        "title": "QAP1 over TCP/IP",
        "url": "tcp://localhost:6312",
        "config": {
            "port": 6312,
            "auth": "required",
            "plaintext": "enabled",
            "pwdfile": __dirname + "/password.txt"
        }
    }
);

require("./normalCommandsTest") (
    {
        "title": "QAP1 over WebSocket",
        "url": "ws://localhost:8081",
        "config": {
            "port": 6312,
            "http.port": 8080,
            "websockets.port": 8081,
            "websockets": "enable",
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
            "port": 6312,
            "http.port": 8080,
            "websockets.port": 8081,
            "websockets": "enable",
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
            "port": 6312,
            "http.port": 8080,
            "websockets.port": 8081,
            "websockets": "enable",
            "oob": "enable",
            "auth": "required",
            "plaintext": "enabled",
            "pwdfile": __dirname + "/password.txt"
        }
    }
);
