var server = require('./index.js');
var port = process.env.PORT || 3000;
var log = console.log;

server.listen(port);

log('You\'re app is running on port '+ port);

module.exports = server;

