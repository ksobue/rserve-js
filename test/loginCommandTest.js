/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const expect = require("chai").expect;
const Rserve = require("..");

function startRserve(config, cb) {
    // 'config' parameter is optional.
    if (typeof config === "function") {
        cb = config;
    }
    
    let args = Object.keys(config).reduce(function(args, key) {
        let val = config[key];
        return args.concat("--RS-set", key + "=" + val);
    }, []);
    
    let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(args), {stdio: "ignore"});
    proc.on("exit", function() {
        // R command spawns Rserve process and exit.
        cb();
    });
}

let tests = [
    {
        title: "QAP1 over TCP/IP",
        url: "tcp://localhost:6311",
        config: {
            "auth": "required",
            "plaintext": "enabled",
            "pwdfile": __dirname + "/password.txt"
        }
    }
];

tests.forEach(function(test) {
    describe(test.title, function() {
        before(function(done) {
            startRserve(test.config, done);
        });
        
        describe("CMD_login command", function() {
            it("accepts user with valid credential [ARuc]", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
                    client.login("foo", "bar", function(err) {
                        expect(err).to.be.null;
                        client.close();
                        done();
                    });
                });
            });
            
            it("reject login with invalid credential [ARuc]", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
                    client.login("foo", "buzz", function(err) {
                        expect(err).not.to.be.null;
                        client.close();
                        done();
                    });
                });
            });
            
            it("accepts user with valid credential [ARpt]", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
                    // Hack to force using ARpt.
                    // ARuc seems always enabled and client.js only falls back to ARpt when ARuc is not available.
                    let idx = client.info.indexOf("ARuc");
                    client.info.splice(idx, 1);
                    
                    client.login("foo", "bar", function(err) {
                        expect(err).to.be.null;
                        client.close();
                        done();
                    });
                });
            });
            
            it("rejects login with invalid credential [ARpt]", function(done) {
                let client = Rserve.connect(test.url, function(loginRequired) {
                    expect(loginRequired).to.be.true;
                    
                    // Hack to force using ARpt.
                    // ARuc seems always enabled and client.js only falls back to ARpt when ARuc is not available.
                    let idx = client.info.indexOf("ARuc");
                    client.info.splice(idx, 1);
                    
                    client.login("foo", "buzz", function(err) {
                        expect(err).not.to.be.null;
                        client.close();
                        done();
                    });
                });
            });
        });
        
        after(function(done) {
            let client = Rserve.connect(test.url, function(loginRequired) {
                if (loginRequired) {
                    client.login("foo", "bar", function(err) {
                        if (err) {
                            throw err;
                        }
                        
                        client.shutdown(null, function(err) {
                            if (err) {
                                throw err;
                            }
                            
                            client.close();
                            done();
                        });
                    });
                }
            });
        });
    });
        
    it("should support CMD_keyReq");
    it("should support CMD_secLogin");
});
