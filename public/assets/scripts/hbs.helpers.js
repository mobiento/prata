(function (Handlebars, Faker) {

	function arrayFromArgs (args) {
		var arr = [];
		for(var i = 0; i < args.length - 1; ++i) { arr.push(args[i]); }
		return arr;
	}

	function setFakerLanguageFromArgs (args) {
		if (typeof args[0] !== 'object') {
			if (typeof args[1] === 'object') { Faker.locale = args[0]; }
			else { Faker.locale = Faker.random.array_element(arrayFromArgs(args)); }		
		}
	}

	Handlebars.registerHelper('_fullname', function () {
		setFakerLanguageFromArgs(arguments);
		return Faker.name.findName();
	});

	Handlebars.registerHelper('_firstname', function () {
		setFakerLanguageFromArgs(arguments);
		return Faker.name.firstName();
	});

	Handlebars.registerHelper('_lastname', function () {
		setFakerLanguageFromArgs(arguments);
		return Faker.name.lastName();
	});

	Handlebars.registerHelper('_city', function () {
		setFakerLanguageFromArgs(arguments);
		return Faker.address.city();
	});

	Handlebars.registerHelper('_state', function () {
		setFakerLanguageFromArgs(arguments);
		return Faker.address.state();
	});

	Handlebars.registerHelper('_random', function () {
		if (typeof arguments[0] === 'number') {
			return Faker.random.number({
				min: (arguments[1] && typeof arguments[1] === 'number') ? arguments[0] : 0, 
				max: (arguments[1] && typeof arguments[1] === 'number') ? arguments[1] : arguments[0], 
				precision: (arguments[2] && typeof arguments[2] === 'number') ? arguments[2] : 1
			});
		}
		if (typeof arguments[0] === 'string') {
			return Faker.random.array_element(arrayFromArgs(arguments));
		}
	});

})(Handlebars, Faker);
