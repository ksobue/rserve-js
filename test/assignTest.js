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
    
    it("supports setting an expression (CMD_setSEXP)", function(done) {
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
    
    it("supports assigning an expression (CMD_assignSEXP)", function(done) {
        client.assignSEXP(
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
