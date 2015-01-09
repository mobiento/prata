require('./jsoneditor.js');

(function ($, document, window) {

	var $section 	= $('#section-editor');
	var el			= document.getElementById('schema-editor');
	var $validate 	= $('.action-showvalidation');
	var $save 		= $('.action-save');
	var $update 	= $('.action-update');

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

			if(editor) {
				editor.destroy();
			}

			try {
				editor = new JSONEditor(el, {
					ajax: true,
					schema: schema,
					startval: data,
					template: 'handlebars',
					theme: 'bootstrap3',
					iconlib: 'bootstrap3',
					disable_edit_json: true,
					disable_properties: true,
					required_by_default: true
				});

				editor.on('change',function() {
					_this.onChange();
				});
			}
			catch (error) {
				console.log(error);
				return;
			}

			$section.show(0, function () {
				$section.addClass('is-loaded');
			});
		},


		/**
		 *
		 *
		 */
		onChange: function () {

			var errors = editor.validate();

			// console.log(errors);

			if(errors.length) {	
				$validate
					.removeClass('btn-success')
					.addClass('btn-danger')
					.text('Not valid');
				$save.attr('disabled', 'true');
				$update.attr('disabled', 'true');

				return;
			}
			else {
				$validate
					.removeClass('btn-danger')
					.addClass('btn-success')
					.text('Valid');
				$save.removeAttr('disabled');
				$update.removeAttr('disabled');
			}

			data = editor.getValue();
			$(document).trigger('change.prata.editor', [data]);
		}
	};

	return new Editor();


})(jQuery, document, window);