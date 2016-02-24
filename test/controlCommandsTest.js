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
            "control": "enable"
        }
    }
];

tests.forEach(function(test) {
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
});
