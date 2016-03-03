/*eslint no-console: 0*/
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const querystring = require("querystring");
const url = require("url");
const spawn = require("child_process").spawn;

let basedir = path.resolve(__dirname, "../..");

let server = http.createServer(function(req, resp) {
    
    let reqURL = url.parse(req.url);
    if (req.method === "GET") {
        // Serves static files.
        let filePath = path.resolve(basedir, reqURL.pathname.substring(1));
        if (reqURL.query === null) {
            // Sends file content as is.
            fs.readFile(filePath, function(err, data) {
                if (err) {
                    resp.writeHead(404);
                    resp.end();
                    return;
                }
                
                resp.writeHead(200);
                resp.write(data);
                resp.end();
            });
            
        } else if (reqURL.query === "browserify") {
            // Sends browserify result of the specified file.
            let browserify = require("browserify");
            let b = browserify();
            b.add(filePath);
            b.bundle(function(err, buffer) {
                if (err) {
                    resp.writeHead(500, "Browserify failed. " + err);
                    resp.end();
                    return;
                }
                
                resp.writeHead(200);
                resp.write(buffer);
                resp.end();
            });
            
        } else {
            resp.writeHead(404);
            resp.end();
        }
        
    } else if (req.method === "POST") {
        if (reqURL.pathname === "/start-r-serve") {
            let data = "";
            req.on("data", function(chunk) {
                data += chunk;
            });
            req.on("end", function() {
                let query = querystring.parse(data);
                let conf = config(query);
                startRserve(conf, function(err, proc) {
                    if (err) {
                        resp.writeHead(500, "Failed to start Rserve. " + err);
                        resp.end();
                        return;
                    }
                    
                    resp.writeHead(200, {
                        "Access-Control-Allow-Origin": "*"
                    });
                    resp.write("" + proc.pid);
                    resp.end();
                    return;
                });
            });
        } else if (reqURL.pathname === "/stop") {
            resp.writeHead(200);
            resp.end();
            server.close();
        } else {
            resp.writeHead(404);
            resp.end();
            return;
        }
    }
});

function config(query) {
    return Object.keys(query).reduce(function(conf, key) {
        let val = query[key];
        
        // __dirname cannot be used in allTests.js since browserify converts to absolute path format based on web root dir.
        // Here, converts password file path to absolute path. Rserve only accept absolute path.
        if (key === "pwdfile") {
            if (! path.isAbsolute(val)) {
                val = path.resolve(__dirname, val);
            }
        }
        
        conf[key] = val;
        return conf;
    }, {});
}

function startRserve(config, cb) {
    
    let args = Object.keys(config).reduce(function(args, key) {
        let val = config[key];
        return args.concat("--RS-set", key + "=" + val);
    }, []);
    
    // R command spawns Rserve process and exit.
    let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(args), {stdio: "ignore"});
    proc.on("uncaughtException", function(err) {
        cb(err);
    });
    proc.on("exit", function() {
        cb(null, proc);
    });
    
    console.log("Rserve (pid:" + proc.pid + ") started with config option " + JSON.stringify(config) + "\n");
}

if (process.argv.indexOf("--stop") !== -1) {
    let req = http.request({
        method: "POST",
        hostname: "localhost",
        port: 6060,
        path: "/stop"
    });
    req.write("a");
    req.end();
    return;
}

server.listen(6060, function() {
    console.log("Open http://localhost:6060/test/browser/mocha.html for browser mocha test.");
});
