/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const Rserve = require("..");

before(function(done) {
    let proc = spawn("R", ["CMD", "Rserve", "--RS-enable-control", "--vanilla"], {stdio: "ignore"});
    proc.on("exit", function() {
        // R command spawns Rserve process and exit.
        done();
    });
});

after(function(done) {
    let client = Rserve.connect("localhost", 6311, function() {
        // Try shutdown as admin user.
        client.ctrlShutdown(function(err, _result) {
            if (err) {
                // If control comand is not supported, try shutdown as normal user.
                client.shutdown(null, function(err, _result) {
                    if (err) {
                        throw err;
                    }
                    
                    client.close();
                    done();
                });
            }
            
            client.close();
            done();
        });
    });
});
