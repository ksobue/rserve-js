module.exports = function(karma_config) {
    var config = {
        autoWatch: false,
        singleRun: true,
        frameworks: ["mocha", "chai"],
        files: ["allTests.js"],
        preprocessors: {
            "allTests.js": ["browserify"]
        },
        browsers: ["Chrome"],
        customLaunchers: {
            Chrome_travis_ci: {
                base: "Chrome",
                flags: ["--no-sandbox"]
            }
        }
    };
    
    if (process.env.TRAVIS) {
        config.browsers = ["Chrome_travis_ci"];
    }
    
    karma_config.set(config);
};
