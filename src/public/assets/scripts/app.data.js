var CodeMirror = require('./app.codemirror.js');

require('./app.editor.js');

(function (CodeMirror, $, document, window) {

	var $section 	= $('#section-data');
	var $textarea	= $('#schema-data');
	var textarea	= document.getElementById('schema-data');
	var $save 		= $('.action-save');
	var $update 	= $('.action-update');
	var $validate 	= $('.action-showvalidation');

	var schema = {};
	var data = {};
	var editor;
	var error;
	var _this;

	/**
	 *
	 *
	 */
	function Data () {
		_this = this;

		this.initialize();
	}



	/**
	 *
	 *
	 */
	Data.prototype = {

		/**
		 *
		 *
		 */
		initialize: function () {
			
			$(document).on('load.prata.schema', function (e, a) {
				schema = a;
				_this.onLoad();
			});

			$(document).on('change.prata.editor', function (e, a) {
				if(a) data = a;
				_this.onEditorUpdate();
			});

			$(document).on('update.prata.schema', function (e, a) {
				if(a) schema = a;
				_this.onUpdate();
			});

			$(document).on('save.prata.schema', function (e, a) {
				if(a) schema = a;
				_this.onSave();
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


		/**
		 *
		 *
		 */
		onLoad: function () {

			$.ajax({
				async: false,
				type: 'GET',
				url: '/' + schema.title
			})
			.done(function(res) {
				data = res;
				$textarea.val( JSON.stringify(data, null, 2) );
				$(document).trigger('load.prata.data', [schema, data]);
			});

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

				editor.on('change', function (edit, obj) {
					try {
						data = jsonlint.parse( edit.getValue('') );
						$textarea.val( JSON.stringify(data, null, 2) );
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

		onEditorUpdate: function () {

			try {
				$textarea.val( JSON.stringify(data, null, 2) );

				if(editor) {
					editor.setValue( $textarea.val() );
				}
				else {
					this.codeMirror();
				}
			}
			catch (err) {
				console.log(err);
			}


		},

		/**
		 *
		 *
		 */
		onUpdate: function () {

			var tmp;

			try {
				tmp = jsonlint.parse( $textarea.val() );
				this.enableUI();
			}
			catch(err) {
				this.disableUI();

				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid data',
						body: err
					}]
				);
			}

			if(error) return;

			$(document).trigger('update.prata.data', [schema, data]);
		},

		onSave: function () {

			var tmp;
			var client = [];
			var server = [];
			var diff = [];
			var message = '';
			var success = false;

			/**
			 *
			 *
			 */
			try {
				tmp = jsonlint.parse( $textarea.val() );
				this.enableUI();
			}
			catch (err) {
				this.disableUI();
				
				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid data',
						body: err
					}]
				);
			}

			if(error) return;

			client = countClientData();
			server = countServerData();

			/**
			 *
			 *
			 */
			if (client.length === server.length) {
				$.each(client, function (i, obj) {
					putData('/'+ schema.title +'/'+ obj, data[i]);
				});
			}


			/**
			 *
			 *
			 */
			if (client.length > server.length) {
				diff = $(client).not(server).get();

				$.each(server, function (i, obj) {
					putData('/'+ schema.title +'/'+ obj, data[i]);
				});

				$.each(diff, function (i, obj) {
					postData('/'+ schema.title, data[obj-1]);
				});
			}


			/**
			 *
			 *
			 */
			if (server.length > client.length) {
				diff = $(server).not(client).get();

				$.each(client, function (i, obj) {
					putData('/'+ schema.title +'/'+ obj, data[i]);
				});

				$.each(diff, function (i, obj) {
					deleteData('/'+ schema.title +'/'+ obj, obj);
				});
			}


			/**
			 *
			 *
			 */
			if(success) this.onSuccess();


			/**
			 *
			 *
			 */
			function countClientData () {
				var arr = [];

				$.each(data, function (i, val) {
					val.id = i + 1;
					arr.push(val.id);
				});

				return arr;
			}


			/**
			 *
			 *
			 */
			function countServerData () {
				var arr = [];

				$.ajax({
					async: false,
					type: 'GET',
					url: '/' + schema.title
				})
				.done(function (res) {
					if(!$.isEmptyObject(res)) {
						$.each(res, function (i, obj) {
							arr.push(obj.id);
						});
					}
				});

				return arr;
			}


			/**
			 *
			 *
			 */
			function postData (url, obj) {
				$.ajax({
					async: false,
					type: 'POST',
					contentType: 'application/json',
					dataType: 'json',
					url: url,
					data: JSON.stringify(obj)
				})
				.done(function (res) {
					console.log('Item '+ obj.id +' created');
					success = true;
					message += obj.id +' '
				});
			}


			/**
			 *
			 *
			 */
			function putData (url, obj) {
				$.ajax({
					async: false,
					type: 'PUT',
					contentType: 'application/json',
					dataType: 'json',
					url: url,
					data: JSON.stringify(obj)
				})
				.done(function (res) {
					console.log('Item '+ obj.id +' updated');
					success = true;
					message += obj.id +' '
				});
			}


			/**
			 *
			 *
			 */
			function deleteData (url, obj) {
				$.ajax({
					async: false,
					type: 'DELETE',
					url: url,
				})
				.done(function () {
					console.log('Item '+ obj +' deleted');
					success = true;
				});
			}
		},


		/**
		 *
		 *
		 */
		onSuccess: function () {
			$(document).trigger('show.prata.modal', 
				[{
					context: 'success',
					title: 'All good.',
					body: 'Schema and data have been saved successfuly.'
				}]
			);

			$.ajax({
				async: false,
				type: 'GET',
				url: '/' + schema.title
			})
			.done(function (res) {
				data = res;
				$(document).trigger('update.prata.data', [schema, data]);
			});
		}

	};

	return new Data();


})(CodeMirror, jQuery, document, window);