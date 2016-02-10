"use strict";

let Rserve = require("..");

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
            });
        }
        
        client.close();
    });
});
