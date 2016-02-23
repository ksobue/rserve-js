/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const Rserve = require("..");

describe("CMD_login", function() {
    
    it("accepts user with valid credential [ARuc]", function(done) {
        let client = Rserve.connect("localhost", 6312, function(loginRequired) {
            expect(loginRequired).to.be.true;
            
            client.login("foo", "bar", function(err) {
                expect(err).to.be.null;
                client.close();
                done();
            });
        });
    });
    
    it("reject login with invalid credential [ARuc]", function(done) {
        let client = Rserve.connect("localhost", 6312, function(loginRequired) {
            expect(loginRequired).to.be.true;
            
            client.login("foo", "buzz", function(err) {
                expect(err).not.to.be.null;
                client.close();
                done();
            });
        });
    });
    
    it("accepts user with valid credential [ARpt]", function(done) {
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
    
    it("rejects login with invalid credential [ARpt]", function(done) {
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
});
