var code = require('./app.codemirror.js');

require('./app.editor.js');

(function (code, $, document, window) {

	var $section 	= $('#section-data');
	var $textarea	= $('#schema-data');
	var textarea	= document.getElementById('schema-data');
	var $save 		= $('.action-savedata');
	var $update 	= $('.action-updatedata');

	var schema = {};
	var data = {};
	var editor;
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

			$update.on('click', function (e) {
				e.preventDefault();
				_this.onUpdate();
			});

			$save.on('click', function (e) {
				e.preventDefault();
				_this.onSave();
			});

			$(document).on('change.prata.editor', function (e, a) {
				if(a) data = a;
				_this.onEditorUpdate();
			});
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

			try {
				editor = code.mirror.fromTextArea(
					textarea, 
					code.options
				);

				editor.on('change', function (code) {
					data = jsonlint.parse(code.getValue(''));
					$textarea.val( code.getValue('') );
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

		onEditorUpdate: function () {

			$textarea.val( JSON.stringify(data, null, 2) );
			editor.setValue( $textarea.val() );
		},

		/**
		 *
		 *
		 */
		onUpdate: function () {
			var tmp;

			try {
				tmp = jsonlint.parse( $textarea.val() );
			}
			catch(error) {
				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid data',
						body: error
					}]
				);
				return;
			}

			$(document).trigger('update.prata.data', [schema, data]);
		},

		onSave: function () {

			var tmp;
			var html = '';
			var success = false;

			try {
				tmp = jsonlint.parse( $textarea.val() );
			}
			catch (error) {
				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Invalid data',
						body: error
					}]
				);
				return;
			}

			$.ajax({
				async: false,
				type: 'GET',
				url: '/' + schema.title
			})
			.done(function (res) {
				if(!$.isEmptyObject(res)) {
					$.each(res, function (i, val) {
						$.ajax({
							async: false,
							type: 'DELETE',
							url: '/' + schema.title + '/' + val.id,
						})
						.done(function () {
							html += 'Item ' + val.id + ' deleted.<br>';
							console.log('Item ' + val.id + ' deleted.');
						});
					});
				}
			});

			$.each(data, function (i, val) {
				val.id = i+1;

				$.ajax({
					async: false,
					type: 'POST',
					contentType: 'application/json',
					dataType: 'json',
					url: '/' + schema.title,
					data: JSON.stringify(val)
				})
				.done(function (data) {
					success = true;
					html += 'Item ' + val.id + ' added.<br>';
					console.log('Item ' + val.id + ' added.');
				});
			});

			if(success) {
				$(document).trigger('show.prata.modal', 
					[{
						context: 'success',
						title: 'Data saved successfuly!',
						body: html
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
			/*
			else {
				$(document).trigger('show.prata.modal', 
					[{
						context: 'danger',
						title: 'Oops!',
						body: 'Something went wrong. Can\'t say what, sorry…'
					}]
				);
			}
			*/
		}

	};

	return new Data();


})(code, jQuery, document, window);