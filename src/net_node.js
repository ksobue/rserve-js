"use strict";

const url = require("url");
const net = require("net");
const WebSocket = require("ws");

// When rserve-js client is connecting to Rserve's websocket port, WebSocket wrapper object with "net" compatible API is used.
function wsnet(websocketUrl) {
    let wrapper = {};
    
    // https://github.com/websockets/ws/issues/684#issuecomment-184873815
    let options = {
        "force new connection": true
    };
    
    let ws = new WebSocket(websocketUrl, "QAP1", options);
    ws.binaryType = "arraybuffer";
    
    wrapper.on = function(eventType, cb) {
        switch (eventType) {
        case "close":
            ws.on("close", cb);
            break;
        case "connect":
            ws.on("open", cb);
            break;
        case "data":
            ws.on("message", function(msg) {
                // "ws" package returns data as first argument, whereas WebSocket standard API states the first argument is MessageEvent.
                let data = msg.data !== undefined ? msg.data : msg;
                // Rserve sends IDstring as string even binary type is specified.
                if (typeof data === "string") {
                    data = new Buffer(data);
                }
                cb(data);
            });
            break;
        case "error":
            ws.on("error", cb);
            break;
        case "timeout":
            // TODO: implement me
            // sending queue size does not decrease for some time,
            // or no 'message' event for some time after sending the last buffer.
            break;
        }
    };
    
    wrapper.write = function(buffer) {
        ws.send(buffer);
    };
    
    wrapper.end = function() {
        ws.close();
    };
    
    return wrapper;
}

module.exports = {
    connect: function(rserveUrlStr) {
        let rserveUrl = url.parse(rserveUrlStr);
        let protocol = rserveUrl.protocol;
        
        if (protocol === "tcp:") {
            return net.connect(rserveUrl.port, rserveUrl.hostname);
        } else if (protocol === "ws:" || protocol === "wss:") {
            return wsnet(rserveUrl);
        } else {
            throw new Error("Unsupported protocol. " + rserveUrlStr);
        }
    }
};
