/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const expect = require("chai").expect;
const Rserve = require("..");

describe("rserve-js's eval command", function() {
    let client;
    
    before(function(done) {
        let options = [
            "--RS-port",    6313
        ];
        let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(options), {stdio: "ignore"});
        proc.on("exit", function() {
            // R command spawns Rserve process and exit.
            client = Rserve.connect("localhost", 6313, function() {
                done();
            });
        });
    });
    
    function evaluatesTo(request, expectedResponse, done) {
        client.eval(request, function(err, response) {
            expect(err).to.be.null;
            expect(response).to.deep.equal(expectedResponse);
            done();
        });
    }
    
    function attr(obj, attr) {
        Object.defineProperties(
            obj,
            {
                "attr": {
                    enumerable: true,
                    value: attr
                }
            }
        );
        
        return obj;
    }
    
    it("supports null (XT_NULL)", function(done) {
        evaluatesTo("NULL", null, done);
    });
    
    it("supports an integer (XT_ARRAY_INT)", function(done) {
        evaluatesTo("as.integer(2)", [2], done);
    });
    
    it("supports integers (XT_ARRAY_INT)", function(done) {
        evaluatesTo("c(as.integer(1), as.integer(3))", [1, 3], done);
    });
    
    it("supports integers with NA (XT_ARRAY_INT)", function(done) {
        evaluatesTo("c(as.integer(1), as.integer(NA), as.integer(3))", [1, null, 3], done);
    });
    
    it("supports a double (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo("as.double(2)", [2], done);
    });
    
    it("supports doubles (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo("c(as.double(1), as.double(3))", [1, 3], done);
    });
    
    it("supports doubles with NA (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo("c(as.double(1), as.double(NA), as.double(3))", [1, null, 3], done);
    });
    
    it("supports doubles with NaN (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo("c(as.double(1), as.double(NaN), as.double(3))", [1, NaN, 3], done);
    });
    
    it("supports a text (XT_ARRAY_STR)", function(done) {
        evaluatesTo("'hello'", ["hello"], done);
    });
    
    it("supports texts (XT_ARRAY_STR)", function(done) {
        evaluatesTo("c('hello', 'world')", ["hello", "world"], done);
    });
    
    it("supports texts with NA (XT_ARRAY_STR)", function(done) {
        evaluatesTo("c('hello', NA, 'world')", ["hello", null, "world"], done);
    });
    
    it("supports boolean TRUE (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo("TRUE", [true], done);
    });
    
    it("supports boolean FALSE (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo("FALSE", [false], done);
    });
    
    it("supports boolean NA (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo("NA", [null], done);
    });
    
    it("supports booleans (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo("c(TRUE, FALSE, NA)", [true, false, null], done);
    });
    
    it("supports vector (XT_VECTOR)", function(done) {
        evaluatesTo("list(c(1, 2), c('a', 'b'), c(TRUE, FALSE))", [[1, 2], ["a", "b"], [true, false]], done);
    });
    
    it ("supports list (XT_LIST_TAG)", function(done) {
        evaluatesTo(
            "as.list(setNames(c(1,2), c('first', 'second')))",
            attr(
                [[1], [2]],
                {
                    names: ["first", "second"]
                }
            ),
            done
        );
    });
    
    it ("supports function (XT_CLOS)", function(done) {
        evaluatesTo(
            "function(a, b) { a + b }",
            {
                formals: {
                    a: "",
                    b: ""
                },
                body: ["{", ["+", "a", "b"]]
            },
            done
        );
    });
    
    it ("supports function with default parameters (XT_CLOS)", function(done) {
        evaluatesTo(
            "function(a = 'hello', b = 2) { rep(a, b) }",
            {
                formals: {
                    a: ["hello"],
                    b: [2]
                },
                body: ["{", ["rep", "a", "b"]]
            },
            done
        );
    });
    
    it ("supports a complex (XT_ARRAY_CPLX)", function(done) {
        evaluatesTo("1 + 2i", [[1, 2]], done);
    });
    
    it ("supports a complexes (XT_ARRAY_CPLX)", function(done) {
        evaluatesTo("c(1 + 2i, 3 + 4i)", [[1, 2], [3, 4]], done);
    });
    
    it ("supports a complexes with NA (XT_ARRAY_CPLX)", function(done) {
        evaluatesTo("c(1 + 2i, NA, 3 + 4i)", [[1, 2], null, [3, 4]], done);
    });
    
    it ("supports matrix", function(done) {
        evaluatesTo(
            "matrix(1:6, nrow=2, ncol=3)",
            attr(
                [1, 2, 3, 4, 5, 6],
                {
                    dim: [2, 3]
                }
            ),
            done
        );
    });
    
    it ("supports matrix by row", function(done) {
        evaluatesTo(
            "matrix(1:6, nrow=2, ncol=3, byrow=TRUE)",
            attr(
                [1, 4, 2, 5, 3, 6],
                {
                    dim: [2, 3]
                }
            ),
            done
        );
    });
    
    it ("supports matrix with dimnames", function(done) {
        evaluatesTo(
            "matrix(1:6, nrow=2, ncol=3, dimnames=list(c('r1', 'r2'), c('c1', 'c2', 'c3')))",
            attr(
                [1, 2, 3, 4, 5, 6],
                {
                    dim: [2, 3],
                    dimnames: [["r1", "r2"], ["c1", "c2", "c3"]]
                }
            ),
            done
        );
    });
    
    it ("supports dataframe", function(done) {
        evaluatesTo(
            "data.frame(c(1, 2), c('red', 'white'), c(TRUE, FALSE))",
            attr(
                [
                    [1, 2],
                    attr(
                        [1, 2],
                        {
                            levels: ["red", "white"],
                            class: ["factor"]
                        }
                    ),
                    [true, false]
                ],
                {
                    names: ["c.1..2.", "c..red....white..", "c.TRUE..FALSE."],
                    "row.names": [null, -2], // see line 239 in REXP.java
                    class: ["data.frame"]
                }
            ),
            done
        );
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
