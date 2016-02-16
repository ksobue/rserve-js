/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const expect = require("chai").expect;
const Rserve = require("..");

describe("rserve-js", function() {
    let client;
    
    before(function(done) {
        let options = [
            "--RS-port",    6314
        ];
        let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(options), {stdio: "ignore"});
        proc.on("exit", function() {
            // R command spawns Rserve process and exit.
            client = Rserve.connect("localhost", 6314, function() {
                done();
            });
        });
    });
    
    it("supports writing new file (CMD_createFile, CMD_writeFile, CMD_closeFile)", function(done) {
        client.createFile(__dirname + "/test.txt", function(err) {
            expect(err).to.be.null;
            
            client.writeFile(new Buffer("written by file test", "utf8"), function(err) {
                expect(err).to.be.null;
                
                client.closeFile(function(err) {
                    expect(err).to.be.null;
                    
                    done();
                });
            });
        });
    });
    
    it("supports reading a file (CMD_openFile, CMD_readFile, CMD_closeFile)", function(done) {
        client.openFile(__dirname + "/test.txt", function(err) {
            expect(err).to.be.null;
            
            client.readFile(null, function(err, buffer) {
                expect(err).to.be.null;
                
                let text = buffer.toString("utf8");
                expect(text).to.equal("written by file test");
                
                client.closeFile(function(err3) {
                    expect(err3).to.be.null;
                    
                    done();
                });
            });
        });
    });
    
    it("supports removing a file (CMD_removeFile)", function(done) {
        client.removeFile(__dirname + "/test.txt", function(err) {
            expect(err).to.be.null;
            
            done();
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
