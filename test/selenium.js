var webdriver 	= require('webdriverio');
var assert      = require('assert');
var async		= require('async');

var browsers 	= [
	{name: 'firefox', os: 'MAC'}, 
	{name: 'chrome', os: 'MAC'},
	{name: 'chrome', os: 'ANDROID'}
];

describe('Client', function() {

	async.forEach(browsers, function(browser, next) {

		var client = webdriver.remote({ 
			host: '127.0.0.1', 
			desiredCapabilities: { 
				browserName: browser.name, 
				platform: browser.os
			}
		});

		describe('GET github.com', function() {
			this.timeout(99999999);

			before(function(done) {
				client.init(done);
			});

			it('should load github.com in ' + browser, function(done) {
				client
				.url('https://github.com/')
				.pause(500)
				.call(done);
			});

			after(function(done) {
				client.end(done);
			});
		});
		next();
	});
});