(function ($) {

	var $modal 		= $('#modal');
	var $content 	= $('#modal-content');
	var $title 		= $('#modal-title');
	var $body 		= $('#modal-body');
	var $footer 	= $('#modal-footer');
	var classes		= 'panel-danger panel-warning panel-success panel-info';

	$(document).on('show.prata.modal', function (e, data) {

		$content.removeClass(classes).addClass('panel-' + data.context);
		$title.html( data.title );
		$body.html( data.body );
		$footer.html( data.footer );
		$modal.modal('show');

		$modal.on('hide.bs.modal', function () {
			if (data.callback) data.callback();
		})
	});

})(jQuery);