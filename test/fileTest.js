/*eslint-env mocha*/
"use strict";

const fs = require("fs");
const expect = require("chai").expect;
const Rserve = require("..");

describe("File I/O commands", function() {
    let client;
    
    before(function(done) {
        client = Rserve.connect("localhost", Rserve.const.default_Rsrv_port, done);
    });
    
    it("supports writing new file (CMD_createFile, CMD_writeFile, CMD_closeFile)", function(done) {
        fs.access(__dirname + "/test.txt", fs.R_OK | fs.W_OK, function(err) {
            expect(err).not.to.be.null; // Make sure file does not yet exist.
        });
        
        client.createFile(__dirname + "/test.txt", function(err) {
            expect(err).to.be.null;
            
            fs.access(__dirname + "/test.txt", fs.R_OK | fs.W_OK, function(err) {
                expect(err).to.be.null;
            });
            
            client.writeFile(new Buffer("written by file test", "utf8"), function(err) {
                expect(err).to.be.null;
                
                client.closeFile(function(err) {
                    expect(err).to.be.null;
                    
                    fs.stat(__dirname + "/test.txt", function(err, stat) {
                        expect(err).to.be.null;
                        expect(stat.size).to.be.greaterThan(0);
                    });
                    
                    done();
                });
            });
        });
    });
    
    it("supports reading a file (CMD_openFile, CMD_readFile, CMD_closeFile)", function(done) {
        client.openFile(__dirname + "/test.txt", function(err) {
            expect(err).to.be.null;
            
            client.readFile(8, function(err, buffer) {
                expect(err).to.be.null;
                
                let text = buffer.toString("utf8");
                expect(text).to.equal("written ");
                
                client.readFile(null, function(err, buffer) {
                    expect(err).to.be.null;
                    
                    let text = buffer.toString("utf8");
                    expect(text).to.equal("by file test");
                    
                    client.closeFile(function(err3) {
                        expect(err3).to.be.null;
                        
                        done();
                    });
                });
            });
        });
    });
    
    it("supports removing a file (CMD_removeFile)", function(done) {
        fs.access(__dirname + "/test.txt", fs.R_OK | fs.W_OK, function(err) {
            expect(err).to.be.null;
        });
        
        client.removeFile(__dirname + "/test.txt", function(err) {
            expect(err).to.be.null;
            
            fs.access(__dirname + "/test.txt", fs.R_OK | fs.W_OK, function(err) {
                expect(err).not.to.be.null; // File no longer exist.
            });
            
            done();
        });
    });
    
    after(function(done) {
        client.close();
        done();
    });
});
