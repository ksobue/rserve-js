"use strict";

let Buffers = require("buffers");
let _ = require("./Rsrv");

function bool(value) {
    let byte;
    
    if (value === true) {
        byte = _.BOOL_TRUE;
    } else if (value === false) {
        byte = _.BOOL_FALSE;
    } else if (value === undefined) {
        byte = _.BOOL_NA;
    } else {
        throw new Error("Unexpected boolean value. " + value);
    }
    
    return byte;
}

function encodeMessage(msg) {
    let buffers = new Buffers();
    
    msg.params.forEach(function(param) {
        let buffer = encodeData(param);
        buffers.push(buffer);
    });
    
    let length = buffers.length;
    let length_0_31 = length;
    let length_32_63 = 0;
    if (length > Math.pow(2, 32)) {
        length_0_31 = length - Math.pow(2, 32);
        length_32_63 = parseInt(length / Math.pow(2, 32));
    }
    
    let headerBuffer = new Buffer(16);
    headerBuffer.writeInt32LE(msg.command, 0);
    headerBuffer.writeInt32LE(length_0_31, 4);
    headerBuffer.writeInt32LE(msg.id || 0, 8);
    headerBuffer.writeInt32LE(length_32_63, 12);
    buffers.unshift(headerBuffer);
    
    return buffers.toString();
    
    function encodeData(data) {
        let buffers = new Buffers();
        
        switch (data.type) {
        case _.DT_INT: // deprecated
            {
                let intVal = data.value;
                let buffer = new Buffer(4);
                buffer.writeInt32LE(intVal, 0);
                buffers.push(buffer);
            }
            break;
        case _.DT_CHAR: // deprecated
            {
                let charVal = data.value;
                let buffer = new Buffer(1);
                buffer.writeInt8(charVal.codePointAt(0), 0);
                buffers.push(buffer);
            }
            break;
        case _.DT_DOUBLE: // deprecated
            {
                let doubleVal = data.value;
                let buffer = new Buffer(8);
                buffer.writeDoubleLE(doubleVal, 0);
                buffers.push(buffer);
            }
            break;
        case _.DT_STRING:
            {
                let strVal = data.value;
                buffers.push(new Buffer(strVal, "utf8"), new Buffer([0]));
            }
            break;
        case _.DT_BYTESTREAM:
            {
                let bytes = data.value;
                let buffer = bytes.slice();
                buffers.push(buffer);
            }
            break;
        case _.DT_SEXP:
            {
                let exprs = data.value;
                let buffer = encodeSEXP(exprs);
                buffers.push(buffer);
            }
            break;
        case _.DT_ARRAY: // deprecated
            {
                let arr = data.value;
                let n = arr.length;
                let buffer = new Buffer(4);
                buffer.writeInt32LE(n, 0);
                buffers.push(buffer);
                for (let i = 0; i < n; i++) {
                    let data = arr[i];
                    let buffer = encodeData(data);
                    buffers.push(buffer);
                }
            }
            break;
        case _.DT_CUSTOM: // deprecated
            {
                let custom = data.value;
                let buffer = custom.slice();
                buffers.push(buffer);
            }
            break;
        default:
            throw new Error("Unknown data type: " + data.type);
        }
        
        let length = buffers.length;
        let length2 = 0;
        if (length > Math.pow(2, 24)) {
            length = parseInt(length / Math.pow(2, 24));
            length2 = length - Math.pow(2, 24);
        }
        
        let type = data.type;
        if (length2 > 0) {
            type |= _.DT_LARGE;
        }
        
        let headerBuffer = new Buffer(length2 === 0 ? 4 : 8);
        headerBuffer.writeInt8(type, 0);
        headerBuffer.writeIntLE(length, 1, 3);
        if (length2 !== 0) {
            headerBuffer.writeInt32LE(length2, 4);
        }
        buffers.unshift(headerBuffer);
        
        if (buffers.length % 4 !== 0) {
            let pad = new Buffer(4 - buffers.length % 4);
            pad.fill(0);
            buffers.push(pad);
        }
        
        return buffers.toBuffer();
        
        
        function encodeSEXP(expr) {
            let buffers = new Buffers();
            
            if (expr.attr !== undefined) {
                let buffer = encodeSEXP(expr.attr);
                buffers.push(buffer);
            }
            
            switch (expr.type) {
            case _.XT_NULL:
                {
                    let buffer = new Buffer();
                    buffers.push(buffer);
                }
                break;
            case _.XT_INT:
                {
                    let intVal = expr.value;
                    let buffer = new Buffer(4);
                    buffer.writeInt32LE(intVal, 0);
                    buffers.push(buffer);
                }
                break;
            case _.XT_DOUBLE:
                {
                    let doubleVal = expr.value;
                    let buffer = new Buffer(8);
                    buffer.writeDoubleLE(doubleVal, 0);
                    buffers.push(buffer);
                }
                break;
            case _.XT_STR:
            case _.XT_SYMNAME:
                {
                    let strVal = expr.value;
                    buffers.push(new Buffer(strVal, "utf8"), new Buffer([0]));
                }
                break;
            case _.XT_SYM:
                {
                    let sym = expr.value;
                    buffers.push(new Buffer(sym, "utf8"));
                }
                break;
            case _.XT_BOOL:
                {
                    let boolVal = expr.value;
                    let buffer = new Buffer(1);
                    buffer.writeInt8(bool(boolVal));
                    buffers.push(buffer);
                }
                break;
            case _.XT_S4:
                {
                    let buffer = new Buffer();
                    buffers.push(buffer);
                }
                break;
            case _.XT_VECTOR:
            case _.XT_LIST_NOTAG:
            case _.XT_LANG_NOTAG:
            case _.XT_VECTOR_EXP:
            case _.XT_VECTOR_STR:
                {
                    let vector = expr.value;
                    for (let i = 0; i < vector.length; i++) {
                        let buffer = encodeSEXP(vector[i]);
                        buffers.push(buffer);
                    }
                }
                break;
            case _.XT_LIST:
            case _.XT_LANG:
                {
                    let list = expr.value;
                    let headBuffer = encodeSEXP(list.head);
                    let valsBuffer = encodeSEXP(list.vals);
                    let tagBuffer = encodeSEXP(list.tag);
                    buffers.push(headBuffer, valsBuffer, tagBuffer);
                }
                break;
            case _.XT_CLOS:
                {
                    let cols = expr.value;
                    let formalsBuffer = encodeSEXP(cols.formals);
                    let bodyBuffer = encodeSEXP(cols.body);
                    buffers.push(formalsBuffer, bodyBuffer);
                }
                break;
            case _.XT_LIST_TAG:
            case _.XT_LANG_TAG:
                {
                    let listTag = expr.value;
                    for (let tag in listTag) {
                        let val = listTag[tag];
                        let valBuffer = encodeSEXP(val);
                        let tagBuffer = encodeSEXP(tag);
                        buffers.push(valBuffer, tagBuffer);
                    }
                }
                break;
            case _.XT_ARRAY_INT:
                {
                    let arr = expr.value;
                    let buffer = new Buffer(4 * arr.length);
                    for (let i = 0; i < arr.length; i++) {
                        let val = arr[i];
                        buffer.writeInt32LE(val, 4 * i);
                    }
                    buffers.push(buffer);
                }
                break;
            case _.XT_ARRAY_DOUBLE:
                {
                    let arr = expr.value;
                    let buffer = new Buffer(8 * arr.length);
                    for (let i = 0; i < arr.length; i++) {
                        let val = arr[i];
                        buffer.writeDoubleLE(val, 8 * i);
                    }
                    buffers.push(buffer);
                }
                break;
            case _.XT_ARRAY_STR:
                {
                    let arr = expr.value;
                    for (let i = 0; i < arr.length; i++) {
                        let val = arr[i];
                        buffers.push(new Buffer(val, "utf8"), new Buffer([0]));
                    }
                    while (buffers.length % 4 !== 0) {
                        buffers.push(new Buffer([0x01]));
                    }
                }
                break;
            case _.XT_ARRAY_BOOL_UA:
                {
                    let arr = expr.value;
                    let buffer = new Buffer(1 * arr.length);
                    for (let i = 0; i < arr.length; i++) {
                        let val = arr[i];
                        buffer.writeInt8LE(bool(val), 1 * i);
                    }
                    buffers.push(buffer);
                }
                break;
            case _.XT_ARRAY_BOOL:
                {
                    let arr = expr.value;
                    let buffer = new Buffer(4 + 1 * arr.length);
                    buffer.writeInt32LE(arr.length, 0);
                    for (let i = 0; i < arr.length; i++) {
                        let val = arr[i];
                        buffer.writeInt8LE(bool(val), 4 + 1 * i);
                    }
                    buffers.push(buffer);
                }
                break;
            case _.XT_RAW:
                {
                    let raw = expr.value;
                    let buffer = new Buffer(4 + raw.length);
                    buffer.writeInt32LE(raw.length, 0);
                    raw.copy(buffer, 4);
                    buffers.push(buffer);
                }
                break;
            case _.XT_ARRAY_CPLX:
                {
                    let arr = expr.value;
                    let buffer = new Buffer(16 * arr.length);
                    for (let i = 0; i < arr.length; i++) {
                        let val = arr[i];
                        buffer.writeDoubleLE(val.re, 16 * i);
                        buffer.writeDoubleLE(val.im, 16 * i + 8);
                    }
                    buffers.push(buffer);
                }
                break;
            case _.XT_UNKNOWN:
                {
                    let type = expr.value;
                    let buffer = new Buffer(4);
                    buffer.writeInt32LE(type, 0);
                    buffers.push(buffer);
                }
                break;
            default:
                throw new Error("Unknown expression type: " + expr.type);
            }
            
            let length = buffers.length;
            let length2 = 0;
            if (length > Math.pow(2, 24)) {
                length = parseInt(length / Math.pow(2, 24));
                length2 = length - Math.pow(2, 24);
            }
            
            let type = expr.type;
            if (length2 > 0) {
                type |= _.XT_LARGE;
            }
            if (expr.attr !== undefined) {
                type |= _.XT_HAS_ATTR;
            }
            
            let headerBuffer = new Buffer(length2 === 0 ? 4 : 8);
            headerBuffer.writeInt8(type , 0);
            headerBuffer.writeIntLE(length, 1, 3);
            if (length2 !== 0) {
                headerBuffer.writeInt32LE(length2, 4);
            }
            buffers.unshift(headerBuffer);
            
            if (buffers.length % 4 !== 0) {
                let pad = new Buffer(4 - buffers.length % 4);
                pad.fill(0);
                buffers.push(pad);
            }
            
            return buffers.toBuffer();
        }
    }
}

module.exports = encodeMessage;
