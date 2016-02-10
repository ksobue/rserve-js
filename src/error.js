"use strict";

let _ = require("./Rsrv");

const ERROR_MESSAGES = (function() {
    let em = {};
    em[_.ERR_auth_failed]       = "ERR_auth_failed";
    em[_.ERR_conn_broken]       = "ERR_conn_broken";
    em[_.ERR_inv_cmd]           = "ERR_inv_cmd";
    em[_.ERR_inv_par]           = "ERR_inv_par";
    em[_.ERR_Rerror]            = "ERR_Rerror";
    em[_.ERR_IOerror]           = "ERR_IOerror";
    em[_.ERR_notOpen]           = "ERR_notOpen";
    em[_.ERR_accessDenied]      = "ERR_accessDenied";
    em[_.ERR_unsupportedCmd]    = "ERR_unsupportedCmd";
    em[_.ERR_unknownCmd]        = "ERR_unknownCmd";
    em[_.ERR_data_overflow]     = "ERR_data_overflow";
    em[_.ERR_object_too_big]    = "ERR_object_too_big";
    em[_.ERR_out_of_mem]        = "ERR_out_of_mem";
    em[_.ERR_ctrl_closed]       = "ERR_ctrl_closed";
    em[_.ERR_session_busy]      = "ERR_session_busy";
    em[_.ERR_detach_failed]     = "ERR_detach_failed";
    em[_.ERR_disabled]          = "ERR_disabled";
    em[_.ERR_unavailable]       = "ERR_unavailable";
    em[_.ERR_cryptError]        = "ERR_cryptError";
    em[_.ERR_securityClose]     = "ERR_securityClose";
    
    return Object.freeze(em);
})();

module.exports = function(statusCode) {
    return ERROR_MESSAGES[statusCode] || "Failed with unknown status code: " + statusCode;
};
