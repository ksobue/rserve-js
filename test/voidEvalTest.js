/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const Rserve = require("..");

describe("CMD_voidEval command", function() {
    let client;
    
    before(function(done) {
        client = Rserve.connect("localhost", Rserve.const.default_Rsrv_port, done);
    });
    
    it("should evaluate R statement without returning value", function(done) {
        client.voidEval("voidEvalTest <- 123", function(err) {
            expect(err).to.be.null;
            expect(arguments).to.have.length(1);
            
            client.eval("voidEvalTest", function(err, response) {
                expect(err).to.be.null;
                expect(response).to.deep.equal([123]);
                
                done();
            });
        });
    });
    
    after(function(done) {
        client.close();
        done();
    });
});
