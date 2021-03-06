# rserve-js   
[![Build Status](https://travis-ci.org/ksobue/rserve-js.svg)](https://travis-ci.org/ksobue/rserve-js) [![npm version](https://badge.fury.io/js/rserve-js.svg)](https://badge.fury.io/js/rserve-js) [![Coverage Status](https://coveralls.io/repos/github/ksobue/rserve-js/badge.svg?branch=master)](https://coveralls.io/github/ksobue/rserve-js?branch=master) [![Dependency Status](https://david-dm.org/ksobue/rserve-js.svg)](https://david-dm.org/ksobue/rserve-js) [![devDependency Status](https://david-dm.org/ksobue/rserve-js/dev-status.svg)](https://david-dm.org/ksobue/rserve-js#info=devDependencies)

RServe client in JavaScript

This node module will communicate with R/Rserve over TCP/IP socket, allowing user to evaluate R statements from JavaScript and get the result as JavaScript object.

## Prerequisites
    $ xcode-select --install # for macOS Sierra 10.12
    $ brew install openssl                                  # Required for TLS support of Rserve.
    $ export LDFLAGS="-L/usr/local/opt/openssl/lib"         # Set as per instruction in brew output.
    $ export CPPFLAGS="-I/usr/local/opt/openssl/include"    # Set as per instruction in brew output.
    $ wget https://rforge.net/Rserve/snapshot/Rserve_1.8-5.tar.gz
    $ R CMD INSTALL Rserve_1.8-5.tar.gz
    $ brew uninstall openssl

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
            console.log("'iris' table is loaded.");
            
            client.eval("dim(iris)", function(err, response) {
                if (err) {
                    throw err;
                }
                
                console.log(response.value); // shows dimension of iris table
            });
        });
    });

## Test
Tested on R version 3.2.3 and Rserve version 1.8.5.

## License
MIT
