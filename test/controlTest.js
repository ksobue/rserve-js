/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const Rserve = require("..");
const expect = require("chai").expect;

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
    
    it("succeeds with valid credential", function(done) {
        let client = Rserve.connect("localhost", 6312, function(loginRequired) {
            expect(loginRequired).to.be.true;
            
            client.login("foo", "bar", function(err) {
                expect(err).to.be.null;
                client.close();
                done();
            });
        });
    });
    
    it("fails with invalid credential", function(done) {
        let client = Rserve.connect("localhost", 6312, function(loginRequired) {
            expect(loginRequired).to.be.true;
            
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
