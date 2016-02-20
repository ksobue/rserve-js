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
    
    it("does not support 'native' encoding (CMD_setEncoding)", function(done) {
        // Client does not know which encoding is set for a server.
        // If it is "latin1", this client cannot decode texts in response messages.
        client.setEncoding("latin1", function(err) {
            expect(err).not.to.be.null;
            done();
        });
    });
    
    it("does not support 'latin1' encoding (CMD_setEncoding)", function(done) {
        // Node.js does not support ISO-8859-1 encoding.
        client.setEncoding("latin1", function(err) {
            expect(err).not.to.be.null;
            done();
        });
    });
    
    it("supports 'utf8' encoding (CMD_setEncoding)", function(done) {
        // rserve-js only support UTF8.
        client.setEncoding("utf8", function(err) {
            expect(err).to.be.null;
            expect(arguments).to.have.length(1);
            
            client.eval("c('Quebec', 'Québec', 'こんにちは', '世界')", function(err, response) {
                expect(err).to.be.null;
                expect(response).to.deep.equal(["Quebec", "Québec", "こんにちは", "世界"]);
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