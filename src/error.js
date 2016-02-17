"use strict";

let _ = require("./Rsrv");

const ERROR_MESSAGES = (function() {
    let em = {};
    em[_.ERR_auth_failed]       = "Authentication failed (ERR_auth_failed).";
    em[_.ERR_conn_broken]       = "Connection closed or broken packet killed it (ERR_conn_broken).";
    em[_.ERR_inv_cmd]           = "Unsupported/invalid command (ERR_inv_cmd).";
    em[_.ERR_inv_par]           = "Some parameters are invalid (ERR_inv_par).";
    em[_.ERR_Rerror]            = "R-error occurred (ERR_Rerror).";
    em[_.ERR_IOerror]           = "I/O error (ERR_IOerror).";
    em[_.ERR_notOpen]           = "Attempt to perform fileRead/Write on closed file (ERR_notOpen).";
    em[_.ERR_accessDenied]      = "Authentication failed or the server doesn't allow this command (ERR_accessDenied).";
    em[_.ERR_unsupportedCmd]    = "Unsupported command (ERR_unsupportedCmd).";
    em[_.ERR_unknownCmd]        = "Unknown command (ERR_unknownCmd).";
    em[_.ERR_data_overflow]     = "Incoming packet is too big (ERR_data_overflow).";
    em[_.ERR_object_too_big]    = "The requested object is too big ti be transported in that way (ERR_object_too_big).";
    em[_.ERR_out_of_mem]        = "Out of memory (ERR_out_of_mem).";
    em[_.ERR_ctrl_closed]       = "Control pipe to the master process is closed or broken (ERR_ctrl_closed).";
    em[_.ERR_session_busy]      = "Session is still busy (ERR_session_busy).";
    em[_.ERR_detach_failed]     = "Unable to detach session (ERR_detach_failed).";
    em[_.ERR_disabled]          = "Feature is disabled (ERR_disabled).";
    em[_.ERR_unavailable]       = "Feature is not present in this build (ERR_unavailable).";
    em[_.ERR_cryptError]        = "Crypto-system error (ERR_cryptError).";
    em[_.ERR_securityClose]     = "Server initiated close due to security violation (ERR_securityClose).";
    
    return Object.freeze(em);
})();

module.exports = function(statusCode) {
    return ERROR_MESSAGES[statusCode] || "Failed with unknown status code: " + statusCode;
};
