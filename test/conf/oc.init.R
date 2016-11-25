ocTest <- "object capability test"
ocStrLen <- Rserve:::ocap(function(str) { nchar(str) }, "strLen")

oc.init <- function() {
    list(ocTest, ocStrLen)
}
