__This is a beta version.__  

# Prata

Prata allows you to generate and/edit data in 3 easy steps:  

 1. Add a schema following the [json-schema.org](http://json-schema.org/) standards.
 2. Edit data based on this structure via a user friendly or code editor.
 3. You can now GET, POST your data from anywhere.

It is a Nodejs application based on [typicode/json-server](https://github.com/typicode/json-server) and [jdorn/json-editor](https://github.com/jdorn/json-editor).  
Therefore we advice you to read the documentation of those two projects before getting started.  

## Installation

You need to [Nodejs](http://nodejs.org/) installed on your computer/server.  
`$ npm install` to install all dependencies required by the project.  
`$ npm start` to run a webserver at [http://localhost:3000/](http://localhost:3000/).  

## Development

`$ npm run dev` to build the project, start the server and watch/rebuild HTML, CSS and JS.  

Under the hood, we're using:  

 - [jshint](https://www.npmjs.com/package/jshint) and [browserify](https://www.npmjs.com/package/browserify) to lint and manage client-side JS.
 - [LESS](https://www.npmjs.com/package/less) to pre-process CSS.
 - [Metalsmith](https://www.npmjs.com/package/metalsmith) to generate HTML from [Handlebars](https://www.npmjs.com/package/handlebars) templates.

## Libraries

### CSS

 - [Bootstrap](http://getbootstrap.com/css/)
 - [CodeMirror](http://codemirror.net/)

### JS

 - [jQuery latest](http://jquery.com/) and [Bootstrap](http://getbootstrap.com/javascript/) because why not.
 - [CodeMirror](http://codemirror.net/) to edit schema and data.
 - [Faker](https://github.com/Marak/faker.js) to generate fake data used via Handlebars helpers.
 - [Handlebars](https://www.npmjs.com/package/handlebars) as a json-editor dependency to populate fields with dynamic values.
 - [jsonlint](https://github.com/zaach/jsonlint) to lint json before posting to server.
 - [json-editor](https://github.com/jdorn/json-editor) to provide a user friendly interface to edit JSON.
