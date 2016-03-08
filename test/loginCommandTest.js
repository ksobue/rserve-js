/*eslint-env mocha*/
"use strict";

module.exports = function(test) {
    const expect = require("chai").expect;
    const Rserve = require("..");
    const startRserve = require("./startRserve");
    
    describe(test.title, function() {
        before(function(done) {
            startRserve(test.config, function(){
                done();
            });
        });
        
        describe("CMD_login command", function() {
            it("accepts user with valid credential [ARuc]", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
                    client.login("foo", "bar", function(err) {
                        expect(err).to.be.null;
                        client.close();
                        done();
                    });
                });
            });
            
            it("reject login with invalid credential [ARuc]", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
                    client.login("foo", "buzz", function(err) {
                        expect(err).not.to.be.null;
                        client.close();
                        done();
                    });
                });
            });
            
            it("accepts user with valid credential [ARpt]", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
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
            
            it("rejects login with invalid credential [ARpt]", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
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
        });
        
        describe("CMD_switch command", function() {
            it("accept TLS protocol", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
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
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
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
        
        // RSA public key returned in CMD_keyReq response does not work
        // https://github.com/s-u/Rserve/issues/60
        describe.skip("CMD_secLogin command", function() {
            it("accept user with encrypted credential", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
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
            let client = Rserve.connect(test.url, function(loginRequired) {
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
};
