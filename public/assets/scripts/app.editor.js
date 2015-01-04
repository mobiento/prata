require('./jsoneditor.js');

(function ($, document, window) {

	var $section 	= $('#section-editor');
	var el			= document.getElementById('schema-editor');

	var schema = {};
	var data = {};
	var editor;
	var _this;


	/**
	 *
	 *
	 */
	function Editor () {
		_this = this;

		this.initialize();
	}



	/**
	 *
	 *
	 */
	Editor.prototype = {

		/**
		 *
		 *
		 */
		initialize: function () {

			$(document).on('load.prata.data update.prata.data save.prata.data update.prata.schema save.prata.schema', function (e, a, b) {
				if(a) schema 	= a;
				if(b) data		= b;

				_this.onLoad();
			});
		},


		/**
		 *
		 *
		 */
		onLoad: function () {

			if(editor) editor.destroy();

			try {
				editor = new JSONEditor(el, {
					ajax: true,
					schema: schema,
					startval: data,
					template: 'handlebars',
					theme: 'bootstrap3',
					iconlib: 'bootstrap3'
				});

				editor.on('change',function() {
					console.log('Editor changed.');
					data = editor.getValue();
					$(document).trigger('change.prata.editor', [data]);
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
		onChange: function (editor) {

			//data = editor.getValue();

			//var errors = editor.validate();
			//var $indicator = $('.action-showvalidation');

			//$(document).trigger('change.prata.editor', [data]);
			// $data.val( JSON.stringify(editor.getValue(), null, 2) );

			/*
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
			*/
		}

	};

	return new Editor();


})(jQuery, document, window);