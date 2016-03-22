"use strict";

const spawn = require("child_process").spawn;
const fs = require("fs");
const path = require("path");

let startRserve = function(config, cb) {
    let args = [];
    
    let pidFileName = `rserve${new Date().getTime()}.pid`;
    let pidFile = path.resolve(__dirname, pidFileName);
    args.push("--RS-pidfile", pidFile);
    
    Object.keys(config).forEach(function(key) {
        let val = config[key];
        args.push("--RS-set", key + "=" + val);
    });
    
    // R command spawns Rserve process and exit.
    let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(args), {stdio: "ignore"});
    proc.on("uncaughtException", function() {
        cb(new Error("Failed to start Rserve."));
    });
    
    let watcher = fs.watch(__dirname, function(_evt, fileName) {
        if (fileName === pidFileName) {
            let pid = parseInt(fs.readFileSync(pidFile, "utf8"));
            
            let server = {
                pid: pid,
                basedir: process.cwd(),
                close: function(cb) {
                    try {
                        process.kill(pid, "SIGINT");
                        cb(null);
                    } catch (err) {
                        cb(err);
                    }
                }
            };
            cb(null, server);
            watcher.close();
        }
    });
};

module.exports = startRserve;
