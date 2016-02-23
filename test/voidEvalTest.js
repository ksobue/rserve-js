/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const Rserve = require("..");
const _ = Rserve.constants;

describe("rserve-js", function() {
    let client;
    
    before(function(done) {
        client = Rserve.connect("localhost", _.default_Rsrv_port, function() {
            done();
        });
    });
    
    it("supports void eval command (CMD_voidEval)", function(done) {
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
