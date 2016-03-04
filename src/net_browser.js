"use strict";

const url = require("url");

function wsnet(websocketUrl) {
    let wrapper = {};
    
    let ws = new WebSocket(websocketUrl, "QAP1");
    ws.binaryType = "arraybuffer";
    
    wrapper.on = function(eventType, cb) {
        switch (eventType) {
        case "close":
            ws.addEventListener("close", cb, false);
            break;
        case "connect":
            ws.addEventListener("open", cb, false);
            break;
        case "data":
            ws.addEventListener("message", function(msg) {
                // Rserve sends IDstring as string even binary type is specified.
                cb(new Buffer(msg.data));
            }, false);
            break;
        case "error":
            ws.addEventListener("error", cb, false);
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
        
        if (protocol === "ws:" || protocol === "wss:") {
            return wsnet(rserveUrlStr);
        } else {
            throw new Error("Unsupported protocol. " + rserveUrlStr);
        }
    }
};
