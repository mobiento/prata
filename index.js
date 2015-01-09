var server 	= require('json-server')
var app 	= server({ schemas: [] }, 'db.json')

app.listen(process.env.PORT || 3000)