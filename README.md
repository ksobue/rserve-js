# rserve-js
RServe client in JavaScript

This node module will communicate with R/Rserve over TCP/IP socket, allowing user to evaluate R statements from JavaScript and get the result as JavaScript object.

## Installation
    $ npm install rserve-js
  
# Usage
    let Rserve = require("rserve-js");
    
    let client = Rserve.connect("localhost", 6311, function() {
      console.log("Connected to Rserve.");
      
      client.eval("data(iris)", function(err, response) {
        if (err) {
          throw err;
        }
        
        client.eval("iris", function(err, response) {
          if (err) {
            throw err;
          }
            
          console.log(response);
        });
    });
  });

This above code will display:
  (todo)

## License
MIT
