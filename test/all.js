/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const Rserve = require("..");

function startRserve(config, cb) {
    // 'config' is optional.
    if (typeof config === "function") {
        cb = config;
    }
    
    let args = Object.keys(config).reduce(function(args, key) {
        let val = config[key];
        return args.concat("--RS-set", key + "=" + val);
    }, []);
    
    let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(args), {stdio: "ignore"});
    
    proc.on("exit", function() {
        // R command spawns Rserve process and exit.
        cb();
    });
}

describe("rserve-js", function() {
    
    describe("authentication", function() {
        before(function(done) {
            startRserve({
                port: 6312,
                auth: "required",
                plaintext: "enabled",
                pwdfile: __dirname + "/password.txt"
            }, done);
        });
        
        require("./loginTest");
        
        after(function(done) {
            let client = Rserve.connect("localhost", 6312, function(loginRequired) {
                if (loginRequired) {
                    client.login("foo", "bar", function(err) {
                        if (err) {
                            throw err;
                        }
                        
                        client.shutdown(null, function(err) {
                            if (err) {
                                throw err;
                            }
                            
                            client.close();
                            done();
                        });
                    });
                }
            });
        });
    });
    
    describe("normal commands", function() {
        before(function(done) {
            startRserve(done);
        });
        
        require("./voidEvalTest");
        require("./evalTest");
        require("./assignSEXPTest");
        require("./setSEXPTest");
        require("./fileTest");
        require("./setBufferSizeTest");
        require("./setEncodingTest");
        require("./shutdownTest");
    });
    
    
    describe("control commands", function() {
        before(function(done) {
            startRserve({"control": "enable"}, done);
        });
        
        require("./ctrlSourceTest");
        require("./ctrlEvalTest");
        require("./ctrlShutdownTest");
    });
    
    it("should support CMD_keyReq");
    it("should support CMD_secLogin");
    it("should support CMD_ocCall");
    it("should support CMD_ocInit");
    it("should support CMD_detachSession");
    it("should support CMD_detachVoidEval");
    it("should support CMD_attachSession");
});
