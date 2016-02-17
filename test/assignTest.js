/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const expect = require("chai").expect;
const Rserve = require("..");

const _ = require("../src/Rsrv"); // TODO: to be removed

describe("rserve-js", function() {
    let client;
    
    before(function(done) {
        let options = [
            "--RS-port",    6313
        ];
        let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(options), {stdio: "ignore"});
        proc.on("exit", function() {
            // R command spawns Rserve process and exit.
            client = Rserve.connect("localhost", 6313, function() {
                done();
            });
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
        client.shutdown(null, function(err) {
            if (err) {
                throw err;
            }
            
            client.close();
            done();
        });
    });
});
