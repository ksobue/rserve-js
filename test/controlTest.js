/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const expect = require("chai").expect;
const Rserve = require("..");

describe("rserve-js's login command", function() {
    
    before(function(done) {
        let options = [
            "--RS-port",    6312,
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
    
    it("succeeds with valid credential (ARuc)", function(done) {
        let client = Rserve.connect("localhost", 6312, function(loginRequired) {
            expect(loginRequired).to.be.true;
            
            client.login("foo", "bar", function(err) {
                expect(err).to.be.null;
                client.close();
                done();
            });
        });
    });
    
    it("fails with invalid credential (ARuc)", function(done) {
        let client = Rserve.connect("localhost", 6312, function(loginRequired) {
            expect(loginRequired).to.be.true;
            
            client.login("foo", "buzz", function(err) {
                expect(err).not.to.be.null;
                client.close();
                done();
            });
        });
    });
    
    it("succeeds with valid credential (ARpt)", function(done) {
        let client = Rserve.connect("localhost", 6312, function(loginRequired) {
            expect(loginRequired).to.be.true;
            
            // Hack to force using ARpt.
            // ARuc seems always enabled and client.js only falls back to ARpt when ARuc is not available.
            let idx = client.info.indexOf("ARuc");
            client.info.splice(idx, 1);
            
            client.login("foo", "bar", function(err) {
                expect(err).to.be.null;
                client.close();
                done();
            });
        });
    });
    
    it("fails with invalid credential (ARpt)", function(done) {
        let client = Rserve.connect("localhost", 6312, function(loginRequired) {
            expect(loginRequired).to.be.true;
            
            // Hack to force using ARpt.
            // ARuc seems always enabled and client.js only falls back to ARpt when ARuc is not available.
            let idx = client.info.indexOf("ARuc");
            client.info.splice(idx, 1);
            
            client.login("foo", "buzz", function(err) {
                expect(err).not.to.be.null;
                client.close();
                done();
            });
        });
    });
    
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
