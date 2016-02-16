/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const expect = require("chai").expect;
const Rserve = require("..");

describe("rserve-js", function() {
    let client;
    
    before(function(done) {
        let options = [
            "--RS-port",    6315
        ];
        let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(options), {stdio: "ignore"});
        proc.on("exit", function() {
            // R command spawns Rserve process and exit.
            client = Rserve.connect("localhost", 6315, function() {
                done();
            });
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
        client.shutdown(null, function(err) {
            if (err) {
                throw err;
            }
            
            client.close();
            done();
        });
    });
});
