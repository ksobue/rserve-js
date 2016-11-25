/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const startRserve = require("./startRserve");
const Rserve = require("..");

module.exports = function(test) {
    
    describe(test.title, function() {
        let server;
        
        before(function(done) {
            startRserve(test.config, function(err, srvr) {
                expect(err).to.be.null;
                server = srvr;
                done();
            });
        });
        
        describe("CMD_login command", function() {
            it("accepts user with valid credential [ARuc]", function(done) {
                let client = Rserve.connect(test.url, function(err) {
                    expect(err).to.be.null;
                    
                    client.login("foo", "bar", function(err) {
                        expect(err).to.be.null;
                        client.close();
                        done();
                    });
                });
            });
            
            it("reject login with invalid credential [ARuc]", function(done) {
                let client = Rserve.connect(test.url, function(err) {
                    expect(err).to.be.null;
                    
                    client.login("foo", "buzz", function(err) {
                        expect(err).not.to.be.null;
                        client.close();
                        done();
                    });
                });
            });
            
            it("accepts user with valid credential [ARpt]", function(done) {
                let client = Rserve.connect(test.url, function(err) {
                    expect(err).to.be.null;
                    
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
            
            it("rejects login with invalid credential [ARpt]", function(done) {
                let client = Rserve.connect(test.url, function(err) {
                    expect(err).to.be.null;
                    
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
        });
        
        describe("CMD_switch command", function() {
            it("accept TLS protocol", function(done) {
                let client = Rserve.connect(test.url, function(err) {
                    expect(err).to.be.null;
                    
                    client.switch("TLS", function(err) {
                        expect(err).to.be.null;
                        client.close();
                        done();
                    });
                });
            });
        });
        
        describe("CMD_keyReq command", function() {
            it("returns authentication key and public key", function(done) {
                let client = Rserve.connect(test.url, function(err) {
                    expect(err).to.be.null;
                    
                    client.keyReq("rsa-authkey", function(err, authKey, publicKey) {
                        expect(err).to.be.null;
                        expect(authKey).not.to.be.null;
                        expect(publicKey).not.to.be.null;
                        client.close();
                        done();
                    });
                });
            });
        });
        
        describe("CMD_secLogin command", function() {
            this.timeout(5000); // Encryption can take time.
            it("accept user with encrypted credential", function(done) {
                let client = Rserve.connect(test.url, function(err) {
                    expect(err).to.be.null;
                    
                    client.keyReq("rsa-authkey", function(err, authKey, publicKey) {
                        expect(err).to.be.null;
                        expect(authKey).not.to.be.null;
                        expect(publicKey).not.to.be.null;
                        
                        client.secLogin(authKey, publicKey, "foo", "bar", function(err) {
                            expect(err).to.be.null;
                            client.close();
                            done();
                        });
                    });
                });
            });
        });
        
        after(function(done) {
            server.close(function(err) {
                expect(err).to.be.null;
                done();
            });
        });
    });
};
