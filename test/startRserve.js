"use strict";

const spawn = require("child_process").spawn;

let startRserve = function(config, cb) {
    // 'config' parameter is optional.
    if (typeof config === "function") {
        cb = config;
        config = {};
    }
    
    let args = Object.keys(config).reduce(function(args, key) {
        let val = config[key];
        return args.concat("--RS-set", key + "=" + val);
    }, []);
    
    // R command spawns Rserve process and exit.
    let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(args), {stdio: "ignore"});
    proc.on("uncaughtException", function() {
        cb(new Error("Failed to start Rserve."));
    });
    proc.on("exit", function() {
        cb(null);
    });
};

module.exports = startRserve;
