var server = require('json-server');

server({ schemas: [] }, 'db.json').listen(3000);