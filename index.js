var server = require('json-server');

server({ schemas: [] }, 'db.json').listen(process.env.PORT || 3000);