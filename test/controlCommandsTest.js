/*eslint-env mocha*/
"use strict";

module.exports = function(test) {
    const expect = require("chai").expect;
    const Rserve = require("..");
    const startRserve = require("./startRserve");

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
                    
                    // Subsequent connection will start with the above string already evaluated.
                    let otherClient = Rserve.connect(test.url, function() {
                        otherClient.eval("ctrlEvalTest", function(err, result) {
                            expect(err).to.be.null;
                            expect(result).to.deep.equal(["control eval test"]);
                            otherClient.close();
                            done();
                        });
                    });
                });
            });
        });
        
        describe("CMD_ctrlSource command", function() {
            it("sources a given R file in the global environment of the server", function(done) {
                client.ctrlSource(dirname + "/conf/ctrlSourceTest.R", function(err) {
                    expect(err).to.be.null;
                    
                    // Subsequent connection will start with the above string already evaluated.
                    let otherClient = Rserve.connect(test.url, function() {
                        otherClient.eval("ctrlSourceTest", function(err, result) {
                            expect(err).to.be.null;
                            expect(result).to.deep.equal(["control source test"]);
                            otherClient.close();
                            done();
                        });
                    });
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
