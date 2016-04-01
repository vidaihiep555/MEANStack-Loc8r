var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/Loc8r';

mongoose.connect(dbURI);

//CONNECTION EVENTS
mongoose.connection.on('connected', function() {
    console.log('Connected to: ' + dbURI);
});
mongoose.connection.on('error', function(error) {
    console.log('Error: ' + error);
});
mongoose.connection.on('disconnected', function() {
    console.log('Disconnected');
});

gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log(msg);
        callback();
    });
};

// For nodemon restart
process.on('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});

// For Heroku app termination
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function() {
        process.exit(0);
    });
});

require('./locations');
