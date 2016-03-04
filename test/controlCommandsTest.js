/*eslint-env mocha*/
"use strict";

module.exports = function(test) {
    const expect = require("chai").expect;
    const Rserve = require("..");
    const startRserve = require("./startRserve");

    describe(test.title, function() {
        let client;
        
        before(function(done) {
            startRserve(test.config, function() {
                client = Rserve.connect(test.url, done);
            });
        });
        
        it("should support CMD_ctrlSource command");
        it("should support CMD_ctrlEval command");
        
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
