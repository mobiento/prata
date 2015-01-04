Handlebars.registerHelper('_fullname', function () {
	return Faker.name.findName();
});

Handlebars.registerHelper('_firstname', function () {
	return Faker.name.firstName();
});

Handlebars.registerHelper('_lastname', function () {
	return Faker.name.lastName();
});

Handlebars.registerHelper('_city', function () {
	return Faker.address.city();
});

Handlebars.registerHelper('_state', function () {
	return Faker.address.state();
});

Handlebars.registerHelper('_number', function (min, max, options) {
	return Faker.random.number({min: min, max: max});
});