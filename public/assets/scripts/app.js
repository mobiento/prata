require('./jsoneditor.js');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/selection/active-line');
var code = require('codemirror/lib/codemirror');
var $ = require('jquery');

var schema = { query: {}, base: 'schemas' },
	q = schema.query;

q.self = window.location.href.match('[?&]schema=([^&]+)');
q.url = window.location.href.match('[?&]url=([^&]+)');

if(q.self) 
{
    q.isNumber = /^[0-9]+$/.test(q.self[1]);
    q.isString = /^[a-z]+$/.test(q.self[1]);

    if(q.isNumber) 
    {
        schema.route = 'schemas/' + q.self[1];
    }
    else if(q.isString)
    {
        schema.route = 'schemas/?title=' + q.self[1];
    }
    else {
        window.location = 'edit.html';
    }

    $.ajax(
    	{
	        async: false,
	        type: 'GET',
	        url: schema.route
    	}
    )
    .done(
    	function (data) 
    	{
        	try {
        		schema.tree = (q.isNumber) ? data : data[0];
        		schema.title = schema.tree.title;
        	}
        	catch(error) {
        		console.log('Schema does not exists: ' + error.message);
        		window.location = 'edit.html';
        	}
        	
    	}
    );
}
else if(q.url)
{
    schema.tree = { $ref: q.url[1] };
    schema.title = q.url[1].match(/\/(.*)\./)[1];
}
else 
{
    schema.tree = {
        title: "schema",
        type: "array",
        items: {
            title: "Item",
            id: "item",
            type: "object",
            properties: {
                property: {
                    type: "string",
                    description: "Description"
                }
            }
        }
    };

    schema.title = schema.data.title;
}

var $tree = $('#schema-tree');
var $data = $('#schema-data');

var $savedata = $('.action-savedata');
var $saveschema = $('.action-saveschema');
var $updatedata = $('.action-updatedata');
var $updateschema = $('.action-updateschema');

var jsoneditor;
var treeeditor;
var dataeditor;

if (schema.title) 
{
	$('title').text($('title').text() + ' ' + schema.title);

    $.ajax(
	    {
	        async: false,
	        type: 'GET',
	        url: schema.title
	    }
	)
	.done(
		function(data) 
		{ 
	        schema.data = data;
	    }
	);
}

$saveschema.on('click', function(e) 
{
	e.preventDefault();

	var schemas;
    var index = 1;

    try {
    	schema.tree = JSON.parse( $tree.val() );
    }
    catch (error) {
    	console.log('Invalid schema: ' + error.message);
    	return;
    }

    if (!schema.tree.id) {

        $.ajax(
        	{
	            async: false,
	            type: 'GET',
	            url: schema.base
	        }
	    )
	    .done(
	    	function (data) 
	    	{
            	schemas = data;
        	}
        );

        $.each(
        	schemas, 
        	function (i, val) 
        	{
            	index += 1;
        	}
        );

        schema.tree.id = index;
    }

    console.log('Request: ');
    console.log(schema.tree);

    $.ajax(
    	{
	        async: false,
	        type: 'POST',
	        contentType: 'application/json',
	        dataType: 'json',
	        url: schema.base,
	        data: JSON.stringify(schema.tree)
    	}
    )
    .done(
    	function (res) 
    	{ 
	        console.log('Response: ');
	        console.log(res);
	        window.location = 'edit.html?schema=' + schema.title ;
    	}
    );
});

$savedata.on('click', function(e) 
{
    e.preventDefault();

    var arr = jsoneditor.getValue();

    $.ajax(
        {
            async: false,
            type: 'GET',
            url: schema.title
        }
    )
    .done(
        function (res) {
            if(!$.isEmptyObject(res)) 
            {
                $.each(
                    res, 
                    function (i, val) 
                    {
                        $.ajax(
                            {
                                async: false,
                                type: 'DELETE',
                                url: schema.title + '/' + val.id,
                            }
                        )
                        .done(function () {
							console.log('Item ' + val.id + ' deleted.');
                        });
                    }
                );
            }
        }
    );

    $.each(
        arr, 
        function (i, val) 
        {
            val.id = i+1;

            $.ajax(
                {
                	async: false,
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    url: schema.title,
                    data: JSON.stringify(val)
                }
            )
            .done(function (data) {
				console.log('Item ' + val.id + ' added.');
            	console.log(data);
            });
        }
    );
});

var reload = function() {

    if(jsoneditor) jsoneditor.destroy();
    if(treeeditor) treeeditor.toTextArea();
    if(dataeditor) dataeditor.toTextArea();

    jsoneditor = new JSONEditor(document.getElementById('editor'), {
        ajax: true,
        schema: schema.tree,
        startval: schema.data,
        theme: 'bootstrap2',
        iconlib: 'fontawesome3'
    });

    window.jsoneditor = jsoneditor;

    treeeditor = code.fromTextArea(document.getElementById('schema-tree'), {
		styleActiveLine: true,
		lineNumbers: true,
		matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        viewportMargin: Infinity,
		mode: 'application/json'
	});

	dataeditor = code.fromTextArea(document.getElementById('schema-data'), {
		styleActiveLine: true,
		lineNumbers: true,
		matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        viewportMargin: Infinity,
		mode: 'application/json'
	});
};


/**
 *
 *
 */
$tree.val( JSON.stringify(schema.tree, null, 2) );
$data.val( JSON.stringify(schema.data, null, 2) );


/**
 *
 *
 */
$updatedata.on('click',function () {
    console.log( $data.val() );
    try {
        schema.data = JSON.parse( $data.val() );
    }
    catch(error) {
        console.log('Invalid data: ' + error.message);
        return;
    }

    reload();
});

$updateschema.on('click', function () {
	console.log( $tree.val() );
    try {
        schema.tree = JSON.parse( $tree.val() );
    }
    catch(error) {
        console.log('Invalid schema: ' + error.message);
        return;
    }

    reload();
});

reload();


/**
 *
 *
 */
treeeditor.on('change', function (code) {
	$tree.val( code.getValue('') );
	console.log( $tree.val() );
});

dataeditor.on('change', function (code) {
	$data.val( code.getValue('') );
	console.log( $data.val() );
});


/**
 *
 *
 */
window.jsoneditor.on('change',function() {
	console.log('change');

    var errors = window.jsoneditor.validate();
    var $indicator = $('.action-showvalidation');

    $data.val( JSON.stringify(jsoneditor.getValue(), null, 2) );

    if(errors.length) {
        $indicator.removeClass('btn-success');
        $indicator.addClass('btn-danger');
        $indicator.text('Not valid');
        $savedata.addClass('disabled');
        $savedata.attr('disabled', 'true');
    }
    else {
        $indicator.removeClass('btn-danger');
        $indicator.addClass('btn-success');
        $indicator.text('Valid');
        $savedata.removeClass('disabled');
        $savedata.removeAttr('disabled');
    }
});