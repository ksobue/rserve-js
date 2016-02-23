/*eslint-env mocha*/
"use strict";

const expect = require("chai").expect;
const Rserve = require("..");

describe("CMD_ctrlShutdown command", function() {
    
    it("shuts down Rserve instance", function(done) {
        let client = Rserve.connect("localhost", Rserve.const.default_Rsrv_port, function() {
            client.ctrlShutdown(function(err) {
                expect(err).to.be.null;
                client.close();
                done();
            });
        });
    });
});
