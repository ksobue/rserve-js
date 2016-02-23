/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const Rserve = require("..");

describe("rserve-js", function() {
    let client;
    
    before(function(done) {
        client = Rserve.connect("localhost", 6312, function() {
            done();
        });
    });
    
    it("supports setting buffer size (CMD_setBufferSize)", function(done) {
        client.setBufferSize(1024, function(err) {
            expect(err).to.be.null;
            done();
        });
    });
    
    after(function(done) {
        client.close();
        done();
    });
});
