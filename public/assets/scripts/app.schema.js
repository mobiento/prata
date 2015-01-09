var CodeMirror = require('./app.codemirror.js');

require('./app.data.js');

(function (CodeMirror, $, document, window) {

	var $section 	= $('#section-schema');
	var $textarea	= $('#schema-tree');
	var textarea	= document.getElementById('schema-tree');
	var $delete 	= $('.action-delete');
	var $save 		= $('.action-save');
	var $update 	= $('.action-update');
	var $validate 	= $('.action-showvalidation');

	var editor;
	var error;
	var _this;

	var schema = { 
		base: '/schemas/',
		query: {
			isLocal: window.location.href.match('[?&]schema=([^&]+)'),
			isRemote: window.location.href.match('[?&]url=([^&]+)'),
		},
		defaults: {
			title: '',
			type: 'array',
			items: {
				title: '',
				id: '',
				type: 'object',
				properties: {
					name: {
						type: 'string'
					}
				}
			}
		}
	};

	var isNumber = function (val) { return /^[0-9]+$/.test(val) };
	var isString = function (val) { return /^\w+$/.test(val) };


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

			$delete.on('click', function (e) {
				e.preventDefault();
				_this.onDelete();
			});
		},


		/**
		 *
		 *
		 */
		disableUI: function () {

			error = true;
			$validate
				.removeClass('btn-success')
				.addClass('btn-danger')
				.text('Not valid');
			$save.attr('disabled', 'true');
			$update.attr('disabled', 'true');
		},

		enableUI: function () {

			error = false;
			$validate
				.removeClass('btn-danger')
				.addClass('btn-success')
				.text('Valid');
			$save.removeAttr('disabled');
			$update.removeAttr('disabled');
		},

		validate: function () {

			if (!schema.data.title) {
				throw 'Title is mandatory.';
			}
			if (!schema.data.type || schema.data.type !== 'array') {
				throw 'Schema type must be an array.';
			}
			if (!isString(schema.data.title)) {
				throw 'Unvalid characters for title.';
			}
		},


		/**
		 *
		 *
		 */
		onLoad: function () {

			if(schema.query.isLocal) {

				if(isNumber(schema.query.isLocal[1])) 		schema.route = schema.base + schema.query.isLocal[1];
				else if(isString(schema.query.isLocal[1])) 	schema.route = schema.base + '?title=' + schema.query.isLocal[1];
				else 										window.location = '/edit/';

				$.ajax({
					async: false,
					type: 'GET',
					url: schema.route
				})
				.done(function (data) {

					try {
						schema.data = (isNumber(schema.query.isLocal[1])) ? data : data[0];
					}
					catch(err) {
						error = true;

						$(document).trigger('show.prata.modal', 
							[{
								context: 'danger',
								title: 'Schema '+ schema.query.isLocal[1] +' does not exist.',
								body: 'Let\'s create one then.'
							}]
						);
					}
				});

				if(error) return;
			}
			else if(schema.query.isRemote) {
				schema.data = { 
					title: schema.query.isRemote[1].match(/\/(.*)\./)[1],
					$ref: schema.query.isRemote[1]
				};

				this.onSave();
			}

			if(schema.data) {
				$('title').text($('title').text() + ' ' + schema.data.title);
				$textarea.val( JSON.stringify(schema.data, null, 2) );
				$(document).trigger('load.prata.schema', [schema.data]);
			}
			else {
				$textarea.val( JSON.stringify(schema.defaults, null, 2) );
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
				editor = CodeMirror.fromTextArea(
					textarea, 
					CodeMirror.options
				);

				editor.on('change', function (edit) {
					try {
						schema.data = jsonlint.parse( edit.getValue('') );
						$textarea.val( JSON.stringify(schema.data, null, 2) );
						_this.validate(schema);
						_this.enableUI();
					}
					catch (err) {
						_this.disableUI();
					}
				});
			}
			catch (err) {
				error = true;
			}

			if(error) return;

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
				this.validate(schema);
				this.enableUI();
			}
			catch(err) {
				this.disableUI();

				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid schema',
						body: error
					}]
				);
			}

			if(error) return;

			$(document).trigger('update.prata.schema', [schema.data]);
		},


		/**
		 *
		 *
		 */
		onSave: function () {

			var schemas;
			var index = 1;

			try {
				schema.data = jsonlint.parse( $textarea.val() );
				this.validate();
				this.enableUI();
			}
			catch (err) {
				this.disableUI();
				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid schema',
						body: err
					}]
				);
			}

			if(error) return;

			if (!schema.data.id) {

				$.ajax({
					async: false,
					type: 'GET',
					url: schema.base
				})
				.done(function (res) {
					schemas = res;
				});

				$.each(schemas, function (i, val) {

					if (val.title === schema.data.title) {
						$(document).trigger('show.prata.modal', 
							[{
								context: 'danger',
								title: 'Invalid schema',
								body: 'The '+ val.title +' schema already exists.'
							}]
						);

						error = true;
						return false;
					}

					index += 1;
				});

				if (error) return;

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
				schema.data = res;
				$textarea.val( JSON.stringify(schema.data, null, 2) );
				if (editor) editor.setValue( $textarea.val() );
				$(document).trigger('show.prata.modal', 
					[{
						context: 'success',
						title: 'All good!',
						body: 'Schema "'+ schema.data.title +'" saved successfully.'
					}]
				);
				$(document).trigger('save.prata.schema', [res]); 
				window.history.pushState({}, '', '/edit/?schema='+ res.title);
			});
		},


		/**
		 *
		 *
		 */
		onDelete: function () {

			$(document).trigger('show.prata.modal',
				[{
					context: 'danger',
					title: 'Danger zone!',
					body: 'Are you sure you want to delete the schema "'+ schema.data.title +'" and all associated data?',
					footer: '<a href="#" type="button" class="btn btn-danger pull-right" onClick="jQuery(document).trigger(\'delete.prata.schema\');" data-dismiss="modal">Delete</a><button type="button" class="btn btn-default pull-left" data-dismiss="modal">Close</button>'
				}]
			);

			$(document).on('delete.prata.schema', function () {
				deleteData();
				deleteSchema();
			});


			/**
			 *
			 *
			 */
			function deleteSchema () {

				$.ajax({
					async: false,
					type: 'DELETE',
					url: schema.base + schema.data.id,
				})
				.done(function () {
					console.log('Schema '+ schema.data.id +' deleted.');
				});
			}


			/**
			 *
			 *
			 */
			function deleteData () {

				$.ajax({
					async: false,
					type: 'GET',
					url: '/' + schema.data.title
				})
				.done(function (res) {
					if(!$.isEmptyObject(res)) {
						$.each(res, function (i, obj) {
							$.ajax({
								async: false,
								type: 'DELETE',
								url: '/'+ schema.data.title +'/'+ obj.id,
							})
							.done(function () {
								console.log('Item '+ obj.id +' deleted.');
							});
						});
					}
				});
			}

		}

	};

	return new Schema();


})(CodeMirror, jQuery, document, window);