ocTest <- "object capability test"
ocStrLen <- Rserve:::ocap(function(str) { nchar(str) })

oc.init <- function() {
    list(ocTest, ocStrLen)
}
