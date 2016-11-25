"use strict";

const _ = require("./Rsrv");

function simplifySEXP(sexp, client) {
    let value = sexp.value;
    
    let attr;
    if (sexp.attr !== undefined) {
        attr = simplifySEXP(sexp.attr);
    }
    
    switch (_.GET_XT(sexp.type)) {
    case _.XT_VECTOR:
    case _.XT_LIST_NOTAG:
    case _.XT_LANG_NOTAG:
    case _.XT_VECTOR_EXP:
    case _.XT_VECTOR_STR:
        if (attr === undefined) {
            value = sexp.value.map(function(value) {
                return simplifySEXP(value, client);
            });
            
        } else if (attr["class"] !== undefined && attr["class"][0] === "data.frame") {
            let columnLabels = attr["names"];
            let rowLabels = attr["row.names"];
            
            let table = [[null]];
            
            columnLabels.forEach(function(columnLabel, i) {
                table[0][i + 1] = columnLabel;
            });
            
            if (rowLabels.length === 2 && rowLabels[0] === null) {
                if (rowLabels[1] >= 0) {
                    let rownums = rowLabels[1];
                    for (let j = 0; j < rownums; j++) {
                        table[j + 1] = [];
                        table[j + 1][0] = j + 1;
                    }
                } else {
                    let rownums = rowLabels[1] * (-1);
                    for (let j = 0; j < rownums; j++) {
                        table[j + 1] = [];
                        table[j + 1][0] = j + 1;
                    }
                }
            } else {
                rowLabels.forEach(function(rowLabel, j) {
                    table[j + 1] = [];
                    table[j + 1][0] = rowLabel;
                });
            }
            
            let columnSexps = sexp.value; // array of column array
            columnSexps.forEach(function(columnSexp, i) {
                let column = simplifySEXP(columnSexp);
                column.forEach(function(val, j) {
                    table[j + 1][i + 1] = val;
                });
            });
            value = table;
            
        } else if (attr["names"] !== undefined) {
            value = [attr["names"], sexp.value.map(simplifySEXP)];
        }
        break;
    case _.XT_LIST:
    case _.XT_LANG:
        if (attr === undefined) {
            value = {
                head: simplifySEXP(sexp.value.head),
                vals: simplifySEXP(sexp.value.vals),
                tag: simplifySEXP(sexp.value.tag)
            };
        }
        break;
    case _.XT_CLOS:
        if (attr === undefined) {
            value = {
                formals: simplifySEXP(sexp.value.formals),
                body: simplifySEXP(sexp.value.body)
            };
        }
        break;
    case _.XT_LIST_TAG:
    case _.XT_LANG_TAG:
        if (attr === undefined) {
            let map = {};
            let valTags = sexp.value;
            for (let i = 0; i < valTags.length; i += 2) {
                let val = simplifySEXP(valTags[i]);
                let tag = simplifySEXP(valTags[i + 1]);
                if (typeof tag !== "string") {
                    throw new Error("Unexpected tag. " + tag);
                }
                map[tag] = val;
            }
            value = map;
        }
        break;
    case _.XT_ARRAY_INT:
    case _.XT_ARRAY_DOUBLE:
    case _.XT_ARRAY_STR:
    case _.XT_ARRAY_BOOL_UA:
    case _.XT_ARRAY_BOOL:
    case _.XT_ARRAY_CPLX:
        if (attr !== undefined) {
            if (attr["class"] !== undefined && attr["class"][0] === "factor") {
                let levels = attr.levels;
                let intVals = sexp.value;
                value = intVals.map(function(intVal) {
                    return levels[intVal - 1];
                });
                
            } else if (attr["class"] !== undefined && attr["class"][0] === "OCref") {
                let ocRef = sexp.value[0];
                value = function() {
                    let args = Array.prototype.slice.apply(arguments);
                    let cb = args.pop();
                    let ocValues = [ocRef].concat(args);
                    let reqSexp = {
                        type: _.XT_LANG_NOTAG,
                        value: ocValues.map(function(ocValue) {
                            return {
                                type: _.XT_ARRAY_STR,
                                value: [ocValue]
                            };
                        })
                    };
                    client.ocCall(reqSexp, cb);
                };
                
            } else if (attr.dim !== undefined) { // matrix
                let rows = attr.dim[0];
                let cols = attr.dim[1];
                
                let table = [];
                for (let i = 0; i < rows; i++) {
                    table[i] = [];
                    for (let j = 0; j < cols; j++) {
                        table[i][j] = sexp.value[i + rows * j];
                    }
                }
                
                if (attr.dimnames !== undefined) {
                    let rowLabels = attr.dimnames[0];
                    if (rowLabels !== undefined) {
                        for (let i = 0; i < rowLabels.length; i++) {
                            let rowLabel = rowLabels[i];
                            table[i].unshift(rowLabel);
                        }
                    }
                    
                    let columnLabels = attr.dimnames[1];
                    if (columnLabels !== undefined) {
                        table.unshift(rowLabels !== undefined ? [null] : []);
                        for (let i = 0; i < columnLabels.length; i++) {
                            let columnLabel = columnLabels[i];
                            table[0].push(columnLabel);
                        }
                    }
                }
                
                value = table;
            }
        }
        break;
    }
    return value;
}

module.exports = {
    simplifySEXP: simplifySEXP
};
