var fs             = require('fs');
var path 					 = require('path');
var express        = require('express');
var server         = require('json-server');
var cors           = require('cors');
var bodyParser     = require('body-parser');
var serveStatic    = require('serve-static');
var methodOverride = require('method-override');
var logger         = require('morgan');
var errorhandler   = require('errorhandler');
var pkg 					 = require('./../package.json');

var log = console.log;
var app = express();
var options;
var root;
var json;

if (!module.parent) {
	server.use(logger('dev'));
}

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cors({ origin: true, credentials: true }));

if (process.env.NODE_ENV === 'development') {
	app.use(errorhandler());
}

// If there's a `public` folder at the root of the app, we serve it
if (fs.existsSync(process.cwd() + '/public')) {
	app.use(serveStatic(process.cwd() + '/public'));
}
// Otherwise we're serving the default one
else {
	app.use(serveStatic(__dirname + '/public'));
}

// The same logic than above applies to `server.json`
if (fs.existsSync(process.cwd() + '/server.json')) {
	root = process.cwd();
} 
else {
	root = __dirname;
}

// Let's try to parse the JSON server configuration
try {
	options = JSON.parse(fs.readFileSync(root + '/server.json'));
} 
catch (err) {
	throw err;
}

if (process.env.NODE_ENV === 'development' && options.dev) {
	options = options.dev;
}

if(options.db.object) {
	try {
		json = JSON.parse(fs.readFileSync(root + '/' + options.db.filename));
	}
	catch (err) {
		throw err;
	}
	
	app.use(server.router(json));
	app.db = json;
}
else {
	app.use(server.router(root + '/' + options.db.filename));
}

module.exports = app;
