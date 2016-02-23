/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const Rserve = require("..");
const _ = Rserve.constants;

describe("rserve-js", function() {
    
    describe("connecting to out-of-box config Rserve", function() {
        before(function(done) {
            let proc = spawn("R", ["CMD", "Rserve", "--vanilla"], {stdio: "ignore"});
            proc.on("exit", function() {
                // R command spawns Rserve process and exit.
                done();
            });
        });
        
        require("./voidEvalTest");
        require("./evalTest");
        require("./assignTest");
        require("./fileTest");
        require("./setBufferSizeTest");
        require("./setEncodingTest");
        
        after(function(done) {
            let client = Rserve.connect("localhost", _.default_Rsrv_port, function() {
                client.shutdown(null, function(err) {
                    if (err) {
                        throw err;
                    }
                    
                    client.close();
                    done();
                });
            });
        });
    });
    
    describe("connecting to localhost:6313", function() {
        before(function(done) {
            let options = [
                "--RS-port",    6313,
                "--RS-set",     "auth=required",
                "--RS-set",     "plaintext=enable",
                "--RS-set",     "pwdfile=" + __dirname + "/password.txt"
            ];
            let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(options), {stdio: "ignore"});
            proc.on("exit", function() {
                // R command spawns Rserve process and exit.
                done();
            });
        });
        
        require("./controlTest");
        
        after(function(done) {
            let client = Rserve.connect("localhost", 6313, function(loginRequired) {
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
});
