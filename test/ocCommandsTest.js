/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const startRserve = require("./startRserve");
const Rserve = require("..");
const _ = Rserve.const;
const simplifySEXP = require("../src/util").simplifySEXP;

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
        
        describe("CMD_ocInit initial command", function() {
            it("should return initial capabilities", function(done) {
                let client = Rserve.connect(test.url, function(err, sexp) {
                    expect(err).to.be.null;
                    let list = simplifySEXP(sexp, client);
                    expect(list.length).to.equal(2);
                    expect(list[0]).to.deep.equal(["object capability test"]);
                    expect(list[1]).to.be.a("function"); // opaque reference to the closure of 'strLen' function
                    client.close();
                    done();
                });
            });
        });
        
        describe("CMD_ocCall command", function() {
            it("should execute wrapped R function", function(done) {
                let client = Rserve.connect(test.url, function(err, sexp) {
                    expect(err).to.be.null;
                    
                    let opaque = sexp.value[1];
                    let strLenRef = opaque.value[0];
                    
                    var strLenCall = {
                        type: _.XT_LANG_NOTAG,
                        value: [
                            {
                                type: _.XT_ARRAY_STR,
                                value: [strLenRef]
                            },
                            {
                                type: _.XT_ARRAY_STR,
                                value: ["hello world"]
                            }
                        ]
                    };
                    client.ocCall(strLenCall, function(err, sexp) {
                        expect(err).to.be.null;
                        expect(simplifySEXP(sexp)).to.deep.equal([11]);
                    });
                    
                    let list = simplifySEXP(sexp, client);
                    expect(list.length).to.equal(2);
                    let strLenFn = list[1];
                    strLenFn("hello world", function(err, sexp) {
                        expect(err).to.be.null;
                        expect(simplifySEXP(sexp)).to.deep.equal([11]);
                        client.close();
                        done();
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
