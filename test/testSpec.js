/*eslint-env mocha*/
"use strict";

let expect = require("chai").expect;
let Rserve = require("..");

describe("rserve-js-client", function() {
    let client;
    
    before(function(done) {
        client = Rserve.connect("localhost", 6311, function() {
            done();
        });
    });
    
    function evaluatesTo(request, expectedResponse, done) {
        client.eval(request, function(err, response) {
            if (err) {
                expect().fail(err);
                return;
            }
            
            expect(response).to.deep.equal(expectedResponse);
            done();
        });
    }
    
    it("supports null (XT_NULL)", function(done) {
        evaluatesTo("NULL", {value: null}, done);
    });
    
    it("supports an integer (XT_ARRAY_INT)", function(done) {
        evaluatesTo("as.integer(2)", {value: [2]}, done);
    });
    
    it("supports integers (XT_ARRAY_INT)", function(done) {
        evaluatesTo("c(as.integer(1), as.integer(3))", {value: [1, 3]}, done);
    });
    
    it("supports a number (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo("as.double(2)", {value: [2]}, done);
    });
    
    it("supports numbers (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo("c(as.double(1), as.double(3))", {value: [1, 3]}, done);
    });
    
    it("supports a text (XT_ARRAY_STR)", function(done) {
        evaluatesTo("'hello'", {value: ["hello"]}, done);
    });
    
    it("supports texts (XT_ARRAY_STR)", function(done) {
        evaluatesTo("c('hello', 'world')", {value: ["hello", "world"]}, done);
    });
    
    it("supports boolean TRUE (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo("TRUE", {value: [true]}, done);
    });
    
    it("supports boolean FALSE (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo("FALSE", {value: [false]}, done);
    });
    
    it("supports boolean NA (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo("NA", {value: [undefined]}, done);
    });
    
    it("supports booleans (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo("c(TRUE, FALSE, NA)", {value: [true, false, undefined]}, done);
    });
    
    it("supports vector (XT_VECTOR)", function(done) {
        evaluatesTo("list(c(1, 2), c('a', 'b'), c(TRUE, FALSE))", {value: [[1, 2], ["a", "b"], [true, false]]}, done);
    });
    
    it ("supports XT_LIST_TAG", function(done) {
        evaluatesTo("as.list(setNames(c(1,2), c('first', 'second')))", {value: [[1], [2]], attr: {names: ["first", "second"]}}, done);
    });
    
    after(function(){
        client.close();
    });
});
