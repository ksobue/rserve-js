/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const startRserve = require("./startRserve");
const Rserve = require("..");
const simplifySEXP = require("../src/util").simplifySEXP;

module.exports = function(test) {

    describe(test.title, function() {
        let client;
        let dirname;
        
        before(function(done) {
            startRserve(test.config, function(err, info) {
                expect(err).to.be.null;
                dirname = info.basedir + "/test";
                client = Rserve.connect(test.url, done);
            });
        });
        
        describe("CMD_ctrlEval command", function() {
            it("evaluates a given string in the global environment of the server", function(done) {
                client.ctrlEval("ctrlEvalTest <- 'control eval test'", function(err) {
                    expect(err).to.be.null;
                    
                    // CMD_ctrlSource and CMD_ctrlEval only queue the command in master server, and the commands are processed aynchronously.
                    setTimeout(function() {
                        // Subsequent connection will start with the above string already evaluated.
                        let otherClient = Rserve.connect(test.url, function() {
                            otherClient.eval("ctrlEvalTest", function(err, sexp) {
                                expect(err).to.be.null;
                                expect(simplifySEXP(sexp)).to.deep.equal(["control eval test"]);
                                otherClient.close();
                                done();
                            });
                        });
                    }, 1);
                });
            });
        });
        
        describe("CMD_ctrlSource command", function() {
            it("sources a given R file in the global environment of the server", function(done) {
                client.ctrlSource(dirname + "/conf/ctrlSourceTest.R", function(err) {
                    expect(err).to.be.null;
                    
                    // CMD_ctrlSource and CMD_ctrlEval only queue the command in master server, and the commands are processed aynchronously.
                    setTimeout(function() {
                        // Subsequent connection will start with the above string already evaluated.
                        let otherClient = Rserve.connect(test.url, function() {
                            otherClient.eval("ctrlSourceTest", function(err, sexp) {
                                expect(err).to.be.null;
                                expect(simplifySEXP(sexp)).to.deep.equal(["control source test"]);
                                otherClient.close();
                                done();
                            });
                        });
                    }, 1);
                });
            });
        });
        
        describe("CMD_ctrlShutdown command", function() {
            it("shuts down Rserve instance", function(done) {
                client.ctrlShutdown(function(err) {
                    expect(err).to.be.null;
                    client.close();
                    done();
                });
            });
        });
    });
};
