/*eslint-env mocha*/
"use strict";

module.exports = function(test) {
    const expect = require("chai").expect;
    const Rserve = require("..");
    const startRserve = require("./startRserve");
    const _ = Rserve.const;

    describe(test.title, function() {
        let client;
        
        before(function(done) {
            startRserve(test.config, function() {
                client = Rserve.connect(test.url, done);
            });
        });
        
        describe("CMD_voidEval command", function() {
            it("should evaluate R statement without returning value", function(done) {
                client.voidEval("voidEvalTest <- 123", function(err) {
                    expect(err).to.be.null;
                    expect(arguments).to.have.length(1);
                    
                    client.eval("voidEvalTest", function(err, response) {
                        expect(err).to.be.null;
                        expect(response).to.deep.equal([123]);
                        
                        done();
                    });
                });
            });
        });
        
        describe("CMD_eval command", function() {
            function evaluatesTo(evalText, expectedJsObj, expectedSEXP, done, skipReEvaluation) {
                client.eval(evalText, function(err, jsObj, sexp) {
                    expect(err).to.be.null;
                    expect(jsObj).to.deep.equal(expectedJsObj);
                    expect(sexp).to.deep.equal(expectedSEXP);
                    
                    if (skipReEvaluation) {
                        done();
                        return;
                    }
                    
                    client.eval(sexp, function(err, jsObj, sexp) {
                        expect(err).to.be.null;
                        expect(jsObj).to.deep.equal(expectedJsObj);
                        expect(sexp).to.deep.equal(expectedSEXP);
                        
                        done();
                    });
                });
            }
            
            it("supports null (XT_NULL)", function(done) {
                evaluatesTo(
                    "NULL",
                    null,
                    {
                        type: _.XT_NULL,
                        value: null
                    },
                    done
                );
            });
            
            it("supports an integer (XT_ARRAY_INT)", function(done) {
                evaluatesTo(
                    "as.integer(2)",
                    [2],
                    {
                        type: _.XT_ARRAY_INT,
                        value: [2]
                    },
                    done
                );
            });
            
            it("supports integers (XT_ARRAY_INT)", function(done) {
                evaluatesTo(
                    "c(as.integer(1), as.integer(3))",
                    [1, 3],
                    {
                        type: _.XT_ARRAY_INT,
                        value: [1, 3]
                    },
                    done
                );
            });
            
            it("supports integers with NA (XT_ARRAY_INT)", function(done) {
                evaluatesTo(
                    "c(as.integer(1), as.integer(NA), as.integer(3))",
                    [1, null, 3],
                    {
                        type: _.XT_ARRAY_INT,
                        value: [1, null, 3]
                    },
                    done
                );
            });
            
            it("supports a double (XT_ARRAY_DOUBLE)", function(done) {
                evaluatesTo(
                    "as.double(2)",
                    [2],
                    {
                        type: _.XT_ARRAY_DOUBLE,
                        value: [2]
                    },
                    done
                );
            });
            
            it("supports doubles (XT_ARRAY_DOUBLE)", function(done) {
                evaluatesTo(
                    "c(as.double(1), as.double(3))",
                    [1, 3],
                    {
                        type: _.XT_ARRAY_DOUBLE,
                        value: [1, 3]
                    },
                    done
                );
            });
            
            it("supports doubles with NA (XT_ARRAY_DOUBLE)", function(done) {
                evaluatesTo(
                    "c(as.double(1), as.double(NA), as.double(3))",
                    [1, null, 3],
                    {
                        type: _.XT_ARRAY_DOUBLE,
                        value: [1, null, 3]
                    },
                    done
                );
            });
            
            it("supports doubles with NaN (XT_ARRAY_DOUBLE)", function(done) {
                evaluatesTo(
                    "c(as.double(1), as.double(NaN), as.double(3))",
                    [1, NaN, 3],
                    {
                        type: _.XT_ARRAY_DOUBLE,
                        value: [1, NaN, 3]
                    },
                    done
                );
            });
            
            it("supports a text (XT_ARRAY_STR)", function(done) {
                evaluatesTo(
                    "'hello'",
                    ["hello"],
                    {
                        type: _.XT_ARRAY_STR,
                        value: ["hello"]
                    },
                    done
                );
            });
            
            it("supports texts (XT_ARRAY_STR)", function(done) {
                evaluatesTo(
                    "c('hello', 'world')",
                    ["hello", "world"],
                    {
                        type: _.XT_ARRAY_STR,
                        value: ["hello", "world"]
                    },
                    done
                );
            });
            
            it("supports texts with NA (XT_ARRAY_STR)", function(done) {
                evaluatesTo(
                    "c('hello', NA, 'world')",
                    ["hello", null, "world"],
                    {
                        type: _.XT_ARRAY_STR,
                        value: ["hello", null, "world"]
                    },
                    done
                );
            });
            
            it("supports boolean TRUE (XT_ARRAY_BOOL)", function(done) {
                evaluatesTo(
                    "TRUE",
                    [true],
                    {
                        type: _.XT_ARRAY_BOOL,
                        value: [true]
                    },
                    done
                );
            });
            
            it("supports boolean FALSE (XT_ARRAY_BOOL)", function(done) {
                evaluatesTo(
                    "FALSE",
                    [false],
                    {
                        type: _.XT_ARRAY_BOOL,
                        value: [false]
                    },
                    done
                );
            });
            
            it("supports boolean NA (XT_ARRAY_BOOL)", function(done) {
                evaluatesTo(
                    "NA",
                    [null],
                    {
                        type: _.XT_ARRAY_BOOL,
                        value: [null]
                    },
                    done
                );
            });
            
            it("supports booleans (XT_ARRAY_BOOL)", function(done) {
                evaluatesTo(
                    "c(TRUE, FALSE, NA)",
                    [true, false, null],
                    {
                        type: _.XT_ARRAY_BOOL,
                        value: [true, false, null]
                    },
                    done
                );
            });
            
            it("supports vector (XT_VECTOR)", function(done) {
                evaluatesTo(
                    "list(c(1, 2), c('a', 'b'), c(TRUE, FALSE))",
                    [[1, 2], ["a", "b"], [true, false]],
                    {
                        type: _.XT_VECTOR,
                        value: [
                            {
                                type: _.XT_ARRAY_DOUBLE,
                                value: [1, 2]
                            },
                            {
                                type: _.XT_ARRAY_STR,
                                value: ["a", "b"]
                            },
                            {
                                type: _.XT_ARRAY_BOOL,
                                value: [true, false]
                            }
                        ]
                    },
                    done
                );
            });
            
            it ("supports list (XT_LIST_TAG)", function(done) {
                evaluatesTo(
                    "as.list(setNames(c(1,2), c('first', 'second')))",
                    [["first", "second"], [[1], [2]]],
                    {
                        type: _.XT_VECTOR | _.XT_HAS_ATTR,
                        value: [
                            {
                                type: _.XT_ARRAY_DOUBLE,
                                value: [1]
                            },
                            {
                                type: _.XT_ARRAY_DOUBLE,
                                value: [2]
                            }
                        ],
                        attr: {
                            type: _.XT_LIST_TAG,
                            value: [
                                {
                                    type: _.XT_ARRAY_STR,
                                    value: ["first", "second"]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "names"
                                }
                            ]
                        }
                    },
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
                    {
                        type: _.XT_CLOS,
                        value: {
                            formals: {
                                type: _.XT_LIST_TAG,
                                value: [
                                    {
                                        type: _.XT_SYMNAME,
                                        value: ""
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "a"
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: ""
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "b"
                                    }
                                ]
                            },
                            body: {
                                type: _.XT_LANG_NOTAG,
                                value: [
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "{"
                                    },
                                    {
                                        type: _.XT_LANG_NOTAG,
                                        value: [
                                            {
                                                type: _.XT_SYMNAME,
                                                value: "+"
                                            },
                                            {
                                                type: _.XT_SYMNAME,
                                                value: "a"
                                            },
                                            {
                                                type: _.XT_SYMNAME,
                                                value: "b"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    done,
                    true // eval command by SEXP(XT_CLOS) returns null (https://github.com/s-u/Rserve/issues/57)
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
                    {
                        type: _.XT_CLOS,
                        value: {
                            formals: {
                                type: _.XT_LIST_TAG,
                                value: [
                                    {
                                        type: _.XT_ARRAY_STR,
                                        value: ["hello"]
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "a"
                                    },
                                    {
                                        type: _.XT_ARRAY_DOUBLE,
                                        value: [2]
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "b"
                                    }
                                ]
                            },
                            body: {
                                type: _.XT_LANG_NOTAG,
                                value: [
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "{"
                                    },
                                    {
                                        type: _.XT_LANG_NOTAG,
                                        value: [
                                            {
                                                type: _.XT_SYMNAME,
                                                value: "rep"
                                            },
                                            {
                                                type: _.XT_SYMNAME,
                                                value: "a"
                                            },
                                            {
                                                type: _.XT_SYMNAME,
                                                value: "b"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    done,
                    true // eval command by SEXP(XT_CLOS) returns null (https://github.com/s-u/Rserve/issues/57)
                );
            });
            
            it ("supports a complex (XT_ARRAY_CPLX)", function(done) {
                evaluatesTo(
                    "1 + 2i",
                    [[1, 2]],
                    {
                        type: _.XT_ARRAY_CPLX,
                        value: [[1, 2]]
                    },
                done);
            });
            
            it ("supports a complexes (XT_ARRAY_CPLX)", function(done) {
                evaluatesTo(
                    "c(1 + 2i, 3 + 4i)",
                    [[1, 2], [3, 4]],
                    {
                        type: _.XT_ARRAY_CPLX,
                        value: [[1, 2], [3, 4]]
                    },
                    done
                );
            });
            
            it ("supports a complexes with NA (XT_ARRAY_CPLX)", function(done) {
                evaluatesTo(
                    "c(1 + 2i, NA, 3 + 4i)",
                    [[1, 2], null, [3, 4]],
                    {
                        type: _.XT_ARRAY_CPLX,
                        value: [[1, 2], null, [3, 4]]
                    },
                    done
                );
            });
            
            it ("supports matrix", function(done) {
                evaluatesTo(
                    "matrix(1:6, nrow=2, ncol=3)",
                    [
                        [1, 3, 5],
                        [2, 4, 6]
                    ],
                    {
                        type: _.XT_ARRAY_INT | _.XT_HAS_ATTR,
                        value: [1, 2, 3, 4, 5, 6],
                        attr: {
                            type: _.XT_LIST_TAG,
                            value: [
                                {
                                    type: _.XT_ARRAY_INT,
                                    value: [2, 3]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "dim"
                                }
                            ]
                        }
                    },
                    done
                );
            });
            
            it ("supports matrix by row", function(done) {
                evaluatesTo(
                    "matrix(1:6, nrow=2, ncol=3, byrow=TRUE)",
                    [
                        [1, 2, 3],
                        [4, 5, 6]
                    ],
                    {
                        type: _.XT_ARRAY_INT | _.XT_HAS_ATTR,
                        value: [1, 4, 2, 5, 3, 6],
                        attr: {
                            type: _.XT_LIST_TAG,
                            value: [
                                {
                                    type: _.XT_ARRAY_INT,
                                    value: [2, 3]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "dim"
                                }
                            ]
                        }
                    },
                    done
                );
            });
            
            it ("supports matrix with dimnames", function(done) {
                evaluatesTo(
                    "matrix(1:6, nrow=2, ncol=3, dimnames=list(c('r1', 'r2'), c('c1', 'c2', 'c3')))",
                    [
                        [null, "c1", "c2", "c3"],
                        ["r1", 1, 3, 5],
                        ["r2", 2, 4, 6]
                    ],
                    {
                        type: _.XT_ARRAY_INT | _.XT_HAS_ATTR,
                        value: [1, 2, 3, 4, 5, 6],
                        attr: {
                            type: _.XT_LIST_TAG,
                            value: [
                                {
                                    type: _.XT_ARRAY_INT,
                                    value: [2, 3]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "dim"
                                },
                                {
                                    type: _.XT_VECTOR,
                                    value: [
                                        {
                                            type: _.XT_ARRAY_STR,
                                            value: ["r1", "r2"]
                                        },
                                        {
                                            type: _.XT_ARRAY_STR,
                                            value: ["c1", "c2", "c3"]
                                        }
                                    ]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "dimnames"
                                }
                            ]
                        }
                    },
                    done
                );
            });
            
            it ("supports dataframe", function(done) {
                evaluatesTo(
                    "data.frame(c(1, 2), c('red', 'white'), c(TRUE, FALSE))",
                    [
                        [null, "c.1..2.", "c..red....white..", "c.TRUE..FALSE."],
                        [1, 1, "red", true],
                        [2, 2, "white", false]
                    ],
                    {
                        type: _.XT_VECTOR | _.XT_HAS_ATTR,
                        value: [
                            {
                                type: _.XT_ARRAY_DOUBLE,
                                value: [1, 2]
                            },
                            {
                                type: _.XT_ARRAY_INT | _.XT_HAS_ATTR,
                                value: [1, 2],
                                attr: {
                                    type: _.XT_LIST_TAG,
                                    value: [
                                        {
                                            type: _.XT_ARRAY_STR,
                                            value: ["red", "white"]
                                        },
                                        {
                                            type: _.XT_SYMNAME,
                                            value: "levels"
                                        },
                                        {
                                            type: _.XT_ARRAY_STR,
                                            value: ["factor"]
                                        },
                                        {
                                            type: _.XT_SYMNAME,
                                            value: "class"
                                        }
                                    ]
                                }
                            },
                            {
                                type: _.XT_ARRAY_BOOL,
                                value: [true, false]
                            }
                        ],
                        attr: {
                            type: _.XT_LIST_TAG,
                            value: [
                                {
                                    type: _.XT_ARRAY_STR,
                                    value: ["c.1..2.", "c..red....white..", "c.TRUE..FALSE."]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "names"
                                },
                                {
                                    type: _.XT_ARRAY_INT,
                                    value: [null, -2]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "row.names"
                                },
                                {
                                    type: _.XT_ARRAY_STR,
                                    value: ["data.frame"]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "class"
                                }
                            ]
                        }
                    },
                    done
                );
            });
        });
        
        describe("CMD_assignSEXP", function() {
            it("should assigning an expression to an object in R", function(done) {
                client.assignSEXP(
                    "test",
                    {
                        type: _.XT_ARRAY_STR,
                        value: ["hello", "world"]
                    },
                    function(err) {
                        expect(err).to.be.null;
                        
                        client.eval("test", function(err, result) {
                            expect(err).to.be.null;
                            expect(result).to.deep.equal(["hello", "world"]);
                            done();
                        });
                    }
                );
            });
        });
        
        describe("CMD_setEXP command", function() {
            it("should set set an expression to an variable in R", function(done) {
                client.setSEXP(
                    "test",
                    {
                        type: _.XT_ARRAY_STR,
                        value: ["hello", "world"]
                    },
                    function(err) {
                        expect(err).to.be.null;
                        
                        client.eval("test", function(err, result) {
                            expect(err).to.be.null;
                            expect(result).to.deep.equal(["hello", "world"]);
                            done();
                        });
                    }
                );
            });
        });
        
        describe("File I/O commands", function() {
            it("supports writing new file (CMD_createFile, CMD_writeFile, CMD_closeFile)", function(done) {
                client.createFile("test.txt", function(err) {
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
                client.openFile("test.txt", function(err) {
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
                client.removeFile("test.txt", function(err) {
                    expect(err).to.be.null;
                    done();
                });
            });
        });
        
        describe("CMD_setBufferSize command", function() {
            it("sets buffer size", function(done) {
                client.setBufferSize(1024, function(err) {
                    expect(err).to.be.null;
                    done();
                });
            });
        });
        
        describe("CMD_setEncoding command", function() {
            it("does not support 'native' encoding", function(done) {
                // Client does not know which encoding is set for a server.
                // If it is "latin1", this client cannot decode texts in response messages.
                client.setEncoding("latin1", function(err) {
                    expect(err).not.to.be.null;
                    done();
                });
            });
            
            it("does not support 'latin1' encoding", function(done) {
                // Node.js does not support ISO-8859-1 encoding.
                client.setEncoding("latin1", function(err) {
                    expect(err).not.to.be.null;
                    done();
                });
            });
            
            it("supports 'utf8' encoding", function(done) {
                // rserve-js only support UTF8.
                client.setEncoding("utf8", function(err) {
                    expect(err).to.be.null;
                    expect(arguments).to.have.length(1);
                    
                    client.eval("c('Quebec', 'Québec', 'こんにちは', '世界')", function(err, response) {
                        expect(err).to.be.null;
                        expect(response).to.deep.equal(["Quebec", "Québec", "こんにちは", "世界"]);
                        done();
                    });
                });
            });
        });
        
        describe("CMD_shutdown command", function() {
            it("shuts down Rserve instance", function(done) {
                let client = Rserve.connect(test.url, function() {
                    client.shutdown(null, function(err) {
                        expect(err).to.be.null;
                        client.close();
                        done();
                    });
                });
            });
        });
        
        it("should support CMD_ocCall");
        it("should support CMD_ocInit");
        it("should support CMD_detachSession");
        it("should support CMD_detachVoidEval");
        it("should support CMD_attachSession");
        
        after(function() {
            client.close();
        });
    });
};
