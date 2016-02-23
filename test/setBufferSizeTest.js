/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const Rserve = require("..");

describe("CMD_setBufferSize command", function() {
    let client;
    
    before(function(done) {
        client = Rserve.connect("localhost", Rserve.const.default_Rsrv_port, done);
    });
    
    it("sets buffer size", function(done) {
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
