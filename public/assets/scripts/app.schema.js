var code = require('./app.codemirror.js');

require('./app.data.js');

(function (code, $, document, window) {

	var $section 	= $('#section-schema');
	var $textarea	= $('#schema-tree');
	var textarea	= document.getElementById('schema-tree');
	var $save 		= $('.action-saveschema');
	var $update 	= $('.action-updateschema');

	var editor;
	var _this;

	var schema = { 
		base: '/schemas/',
		query: {
			isLocal: window.location.href.match('[?&]schema=([^&]+)'),
			isRemote: window.location.href.match('[?&]url=([^&]+)'),
		}
	};

	var isNumber = function (val) { return /^[0-9]+$/.test(val) };
	var isString = function (val) { return /^[a-z]+$/.test(val) };


	/**
	 *
	 *
	 */
	function Schema () {
		_this = this;

		this.initialize();
	}



	/**
	 *
	 *
	 */
	Schema.prototype = {

		/**
		 *
		 *
		 */
		initialize: function () {
			
			this.onLoad();

			$save.on('click', function (e) {
				e.preventDefault();
				_this.onSave();
			});

			$update.on('click', function (e) {
				e.preventDefault();
				_this.onUpdate();
			});
		},


		/**
		 *
		 *
		 */
		onLoad: function () {

			if(schema.query.isLocal) {

				if(isNumber(schema.query.isLocal[1])) 		schema.route = schema.base + schema.query.isLocal[1];
				else if(isString(schema.query.isLocal[1])) 	schema.route = schema.base + '?title=' + schema.query.isLocal[1];
				else 										window.location = '/add/';

				$.ajax({
					async: false,
					type: 'GET',
					url: schema.route
				})
				.done(function (data) {

					try {
						schema.data = (isNumber(schema.query.isLocal[1])) ? data : data[0];
					}
					catch(error) {
						$(document).trigger('show.prata.modal', 
							[{
								context: 'danger',
								title: 'Schema "'+ schema.query.isLocal[1] +'" does not exist.',
								body: 'Let\'s create one then.'
							}]
						);

						return;
					}
				});
			}
			else if(schema.query.isRemote) {
				schema.data = { 
					title: schema.query.isRemote[1].match(/\/(.*)\./)[1],
					$ref: schema.query.isRemote[1]
				};
			}

			if(schema.data) {
				$('title').text($('title').text() + ' ' + schema.data.title);
				$textarea.val( JSON.stringify(schema.data, null, 2) );
				$(document).trigger('load.prata.schema', [schema.data]);
			}
			else {
				$textarea.val( JSON.stringify({}, null, 2) );
			}
			
			this.codeMirror();
		},


		/**
		 *
		 *
		 */
		codeMirror: function () {

			if(editor) editor.toTextArea();

			try {
				editor = code.mirror.fromTextArea(
					textarea, 
					code.options
				);

				editor.on('change', function (code) {
					schema.data = code.getValue('')
					$textarea.val( schema.data );
				});
			}
			catch (error) {
				console.log(error);
				return;
			}

			$section.show(0, function () {
				$section.addClass('is-loaded');
			})
		},


		/**
		 *
		 *
		 */
		onUpdate: function () {

			try {
				schema.data = jsonlint.parse( $textarea.val() );
			}
			catch(error) {
				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid schema',
						body: error
					}]
				);
				return;
			}

			$(document).trigger('update.prata.schema', [schema.data]);
		},

		onSave: function () {

			var schemas;
			var index = 1;
			var exit = false;

			try {
				schema.data = jsonlint.parse( $textarea.val() );
			}
			catch (error) {
				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid schema',
						body: error
					}]
				);
				return;
			}

			if (!schema.data.title) {

				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid schema',
						body: 'Title is mandatory.'
					}]
				);
				return;
			}

			if (!schema.data.id) {

				$.ajax({
					async: false,
					type: 'GET',
					url: schema.base
				})
				.done(function (data) {
					schemas = data;
				});

				$.each(schemas, function (i, val) {

					if (val.title === schema.data.title) {
						$(document).trigger('show.prata.modal', 
							[{
								context: 'danger',
								title: 'Invalid schema',
								body: 'The "'+ val.title +'" schema already exists.'
							}]
						);

						exit = true;
						return false;
					}

					index += 1;
				});

				if (exit) return;

				schema.data.id = index;
			}

			$.ajax({
				async: false,
				type: 'POST',
				contentType: 'application/json',
				dataType: 'json',
				url: schema.base,
				data: JSON.stringify(schema.data)
			})
			.done(function (res) { 
				$(document).trigger('show.prata.modal', 
					[{
						context: 'success',
						title: 'Schema "' + schema.data.title + '" is saved',
						body: 'All right! Let\'s edit some "' + schema.data.title + '" then.',
						footer: '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>',
						callback: function () { 
							$(document).trigger('save.prata.schema', [schema.data]); 
							window.history.pushState({}, '', '/edit/?schema='+ schema.data.title); 
						}
					}]
				);
			});
		}

	};

	return new Schema();


})(code, jQuery, document, window);