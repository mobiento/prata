var server 	= require('json-server')
var auth 	= require('http-auth')
var app 	= server({ schemas: [] }, 'db.json')

var basic = auth.basic({
	realm: 'Requires authentication.',
	file: __dirname + '/.htpasswd'
})

app.use(auth.connect(basic))
app.listen(process.env.PORT || 3000)