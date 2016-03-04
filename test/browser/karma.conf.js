module.exports = function(config) {
    config.set({
        frameworks: ["mocha", "chai"],
        files: ["allTests.js"],
        preprocessors: {
            "allTests.js": ["browserify"]
        },
        autoWatch: false,
        browsers: ["Chrome"],
        singleRun: true
    });
};
