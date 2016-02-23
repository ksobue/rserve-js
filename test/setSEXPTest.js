/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const Rserve = require("..");
const _ = Rserve.const;

describe("CMD_setEXP command", function() {
    let client;
    
    before(function(done) {
        client = Rserve.connect("localhost", _.default_Rsrv_port, done);
    });
    
    it("should set set an expression to an variable in R", function(done) {
        client.setSEXP(
            "test",
            {
                type: _.XT_ARRAY_STR,
                value: ["hello", "world"]
            },
            function(err) {
                expect(err).to.be.null;
                
                client.eval("test", function(err, result) {
                    expect(err).to.be.null;
                    expect(result).to.deep.equal(["hello", "world"]);
                    done();
                });
            }
        );
    });
    
    after(function(done) {
        client.close();
        done();
    });
});
