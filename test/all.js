/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const Rserve = require("..");

describe("rserve-js instance", function() {
    
    describe("connecting to localhost:6312", function() {
        before(function(done) {
            let options = [
                "--RS-port",    6312
            ];
            let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(options), {stdio: "ignore"});
            proc.on("exit", function() {
                // R command spawns Rserve process and exit.
                done();
            });
        });
        
        require("./assignTest");
        require("./evalTest");
        require("./fileTest");
        require("./setBufferSizeTest");
        require("./setEncodingTest");
        require("./voidEvalTest");
        
        after(function(done) {
            let client = Rserve.connect("localhost", 6312, function() {
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
