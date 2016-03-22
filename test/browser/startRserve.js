"use strict";

const http = require("http");
const querystring = require("querystring");

let startRserve = function(config, cb) {
    // 'config' parameter is optional.
    if (typeof config === "function") {
        cb = config;
        config = {};
    }
    
    let query = querystring.stringify(config);
    let req = http.request(
        {
            method: "POST",
            hostname: "localhost",
            port: 6060,
            path: "/start-r-serve",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": query.length
            }
        },
        function(res) {
            if (res.statusCode !== 200) {
                cb(new Error("Failed to start Rserve."));
                return;
            }
            
            let buffers = [];
            res.on("data", function(buffer) {
                buffers.push(buffer);
            });
            res.on("end", function() {
                let info = JSON.parse(Buffer.concat(buffers).toString("utf8"));
                
                let server = {
                    basedir: info.basedir,
                    close: function(cb) {
                        let query = querystring.stringify({
                            pid: info.pid
                        });
                        let req = http.request(
                            {
                                method: "POST",
                                hostname: "localhost",
                                port: 6060,
                                path: "/stop-r-serve",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded",
                                    "Content-Length": query.length
                                }
                            },
                            function(res) {
                                if (res.statusCode !== 200) {
                                    cb(new Error("Failed to stop Rserve."));
                                    return;
                                }
                                
                                cb(null);
                            }
                        );
                        req.write(query);
                        req.end();
                    }
                };
                cb(null, server);
            });
        }
    );
    req.write(query);
    req.end();
};

module.exports = startRserve;
