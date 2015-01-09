var fs 		= require('fs')
var server 	= require('json-server')
var json
var app

if(process.env.NODE_ENV === 'production') {
	json = JSON.parse(fs.readFileSync('db.json', 'utf8'))
	app = server(json)
}
else {
	app = server({}, 'db.json')
}


app.listen(process.env.PORT || 3000)