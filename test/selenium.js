var webdriver 	 = require('webdriverio');
var assert       = require('assert');
var async		 = require('async');

var capabilities = [
	// {
	// 	browserName: 'firefox', 
	// 	platform: 'MAC'
	// },
	// {
	// 	browserName: 'chrome', 
	// 	platform: 'MAC'
	// },
	// {
	// 	browserName: 'safari', 
	// 	platform: 'MAC'
	// },
	// {
	// 	browserName: 'firefox', 
	// 	platform: 'WINDOWS'
	// },
	// {
	// 	browserName: 'internet explorer', 
	// 	platform: 'WINDOWS'
	// },
	{
		browserName: 'chrome', 
		platform: 'WINDOWS'
	},
	// {
	// 	browserName: 'chrome', 
	// 	platform: 'MAC', 
	// 	version: 'android', 
	// 	'chromeOptions': {
	// 		'androidPackage': 'com.android.chrome'
	// 	}
	// }
];

describe('Client', function() {

	async.forEach(capabilities, function(capability, next) {

		var client = webdriver.remote({ 
			host: '127.0.0.1', 
			desiredCapabilities: capability
		});

		describe('GET github.com', function() {
			this.timeout(99999999);

			before(function(done) {
				client.init(done);
			});

			it('should load github.com', function(done) {
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