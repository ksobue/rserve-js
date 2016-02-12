"use strict";

let _ = require("./Rsrv");


function bool(byte) {
    let value;
    
    if (byte === _.BOOL_TRUE) {
        value = true;
    } else if (byte === _.BOOL_FALSE) {
        value = false;
    } else if (byte === _.BOOL_NA) {
        value = null;
    } else {
        throw new Error("Unexpected boolean value. " + byte);
    }
    
    return value;
}

const INT_NA = new Buffer([0x80, 0x00, 0x00, 0x00].reverse());
const DOUBLE_NA = new Buffer([0xa2, 0x07, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x7f]);
const STR_NA = new Buffer([0xff, 0x00]);

function decodeMessage(buffer) {
    let pos = 0;
    
    let command = buffer.readInt32LE(pos);
    pos += 4;
    let length_0_31 = buffer.readInt32LE(pos);
    pos += 4;
    let messageId = buffer.readInt32LE(pos);
    pos += 4;
    let length_32_63 = buffer.readInt32LE(pos);
    pos += 4;
    
    let length = length_32_63 * Math.pow(2, 32) + length_0_31;
    if (length > Number.MAX_SAFE_INTEGER) { // 8191 peta bytes
        throw new Error("Incoming message data is too large to be handled in JavaScript. (" + length + "bytes)");
    }
    
    let params = [];
    while (pos < buffer.length) {
        let param = decodeData(buffer);
        params.push(param);
    }
    
    return {
        id: messageId,
        command: command,
        params: params
    };
    
    
    function decodeData(buffer) {
        let value;
        
        let type = buffer.readInt8(pos + 0);
        pos += 1;
        let length = buffer.readIntLE(pos, 3);
        pos += 3;
        
        if (_.IS_LARGE(type)) {
            let length2 = buffer.readInt32LE(pos);
            pos += 4;
            length += length2 * Math.pow(2, 24);
        }
        
        switch (_.GET_DT(type)) {
        case _.DT_INT:
            value = buffer.readInt32LE(pos);
            pos += 4;
            break;
        case _.DT_CHAR: // deprecated
            value = String.fromCodePoint(buffer.readInt8(pos));
            pos += 1;
            break;
        case _.DT_DOUBLE: // deprecated
            value = buffer.readDoubleLE(pos);
            pos += 8;
            break;
        case _.DT_STRING:
            let nullPos = buffer.indexOf(0x00, pos);
            value = buffer.toString("utf8", pos, nullPos);
            pos = nullPos + 1;
            break;
        case _.DT_BYTESTREAM:
            value = buffer.slice(pos, pos + length);
            pos += length;
            break;
        case _.DT_SEXP:
            value = decodeSEXP(buffer);
            break;
        case _.DT_ARRAY: // deprecated
            value = [];
            let n = buffer.readInt32LE(pos);
            pos += 4;
            for (let i = 0; i < n; i++) {
                let val = decodeData(buffer);
                value.push(val);
            }
            break;
        case _.DT_CUSTOM: // deprecated
            value = buffer.slice(pos, pos + length);
            pos += length;
            break;
        default:
            throw new Error("Unknown data type: " + type);
        }
        
        while (pos % 4 !== 0) {
            pos++;
        }
        
        return value;
        
        
        function decodeSEXP(buffer) {
            let value, attr;
            
            let type = buffer.readInt8(pos);
            pos += 1;
            let length = buffer.readIntLE(pos, 3);
            pos += 3;
            
            if (_.IS_LARGE(type)) {
                let length2 = buffer.readInt32LE(pos);
                pos += 4;
                length += length2 * Math.pow(2, 24);
            }
            
            let eoa = pos + length;
            
            if (_.HAS_ATTR(type)) {
                attr = decodeSEXP(buffer);
            }
            
            let dataLength = eoa - pos; // without attribute
            
            switch (_.GET_XT(type)) {
            case _.XT_NULL:
                {
                    value = null;
                }
                break;
            case _.XT_INT:
                {
                    value = buffer.readInt32LE(pos);
                    pos += 4;
                }
                break;
            case _.XT_DOUBLE:
                {
                    value = buffer.readDoubleLE(pos);
                    pos += 8;
                }
                break;
            case _.XT_STR:
            case _.XT_SYMNAME:
                {
                    value = buffer.toString("utf8", pos, buffer.indexOf(0x00, pos));
                    pos += dataLength;
                }
                break;
            case _.XT_SYM:
                {
                    value = buffer.toString("utf8", pos, pos + dataLength);
                    pos += dataLength;
                }
                break;
            case _.XT_BOOL:
                {
                    value = bool(buffer.readInt8(pos));
                    pos += 1;
                }
                break;
            case _.XT_S4:
                {
                    value = {};
                }
                break;
            case _.XT_VECTOR:
            case _.XT_LIST_NOTAG:
            case _.XT_LANG_NOTAG:
            case _.XT_VECTOR_EXP:
            case _.XT_VECTOR_STR:
                {
                    value = [];
                    while (pos < eoa) {
                        let val = decodeSEXP(buffer);
                        value.push(val);
                    }
                }
                break;
            case _.XT_LIST:
            case _.XT_LANG:
                {
                    value = {
                        head: decodeSEXP(buffer),
                        vals: decodeSEXP(buffer),
                        tag: decodeSEXP(buffer)
                    };
                }
                break;
            case _.XT_CLOS:
                {
                    value = {
                        formals: decodeSEXP(buffer),
                        body: decodeSEXP(buffer)
                    };
                }
                break;
            case _.XT_LIST_TAG:
            case _.XT_LANG_TAG:
                {
                    value = {};
                    while (pos < eoa) {
                        let val = decodeSEXP(buffer);
                        let tag = decodeSEXP(buffer);
                        value[tag] = val;
                    }
                }
                break;
            case _.XT_ARRAY_INT:
                {
                    value = [];
                    for (let i = 0; i < dataLength / 4; i++) {
                        let val = buffer.readInt32LE(pos);
                        pos += 4;
                        
                        if (val === INT_NA.readInt32LE(0)) {
                            val = null;
                        }
                        value.push(val);
                    }
                }
                break;
            case _.XT_ARRAY_DOUBLE:
                {
                    value = [];
                    for (let i = 0; i < dataLength / 8; i++) {
                        let val = buffer.readDoubleLE(pos);
                        pos += 8;
                        
                        if (isNaN(val) && buffer.slice(pos - 8, pos).equals(DOUBLE_NA)) { // DOUBLE_NA.readDoubleLE() returns NaN
                            val = null;
                        }
                        
                        value.push(val);
                    }
                }
                break;
            case _.XT_ARRAY_STR:
                {
                    value = [];
                    while (pos < eoa) {
                        if (buffer[pos] === 0x01) {
                            pos++;
                            continue;
                        }
                        
                        let nullPos = buffer.indexOf(0x00, pos);
                        let val = buffer.toString("utf8", pos, nullPos);
                        pos = nullPos + 1;
                        
                        if (val === STR_NA.toString("utf8", 0, 1)) {
                            val = null;
                        }
                        
                        value.push(val);
                    }
                }
                break;
            case _.XT_ARRAY_BOOL_UA:
                {
                    value = [];
                    while (pos < eoa) {
                        let val = bool(buffer.readInt8(pos));
                        pos += 1;
                        value.push(val);
                    }
                }
                break;
            case _.XT_ARRAY_BOOL:
                {
                    value = [];
                    let n = buffer.readInt32LE(pos);
                    pos += 4;
                    for (let i = 0; i < n; i++) {
                        let val = bool(buffer.readInt8(pos));
                        pos += 1;
                        
                        value.push(val);
                    }
                }
                break;
            case _.XT_RAW:
                {
                    value = [];
                    let n = buffer.readInt32LE(pos);
                    pos += 4;
                    for (let i = 0; i < n; i++) {
                        let val = buffer.readInt8(pos);
                        pos += 1;
                        value.push(val);
                    }
                }
                break;
            case _.XT_ARRAY_CPLX:
                {
                    value = [];
                    for (let i = 0; i < dataLength / 16; i++) {
                        let re = buffer.readDoubleLE(pos);
                        pos += 8;
                        let im = buffer.readDoubleLE(pos);
                        pos += 8;
                        value.push([re, im]);
                    }
                }
                break;
            case _.XT_UNKNOWN:
                {
                    let type = buffer.readInt32LE(pos);
                    pos += 4;
                    value = type;
                }
                break;
            default:
                throw new Error("Unknown expression type: " + type);
            }
            
            while (pos % 4 !== 0) {
                pos++;
            }
            
            if (attr !== undefined) {
                Object.defineProperty(value, "attr", {
                    enumerable: true,
                    value: attr
                });
            }
            
            return value;
        }
    }
}

module.exports = decodeMessage;
