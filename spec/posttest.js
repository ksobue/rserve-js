"use strict";

let Rserve = require("..");

let client = Rserve.connect("localhost", 6311, function() {
    client.ctrlShutdown(function(err, _result) {
        if (err) {
            throw err;
        }
        
        client.close();
    });
});
