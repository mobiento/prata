(function ($) {

	var $edit = $('#menu-edit-list');
	var blacklist = [
			'schema',
			'schemas',
			'undefined',
			'favicon.ico'
		];

	$
		.get('/db/')
		.then(
		    function(resp) 
		    {

		        $edit.empty();
		        $edit.append('<li role="presentation"><a role="menuitem" tabindex="-1" href="/edit/">New</a></li>');

		        $.each(
		            resp, 
		            function(key, value) 
		            {
		                if($.inArray(key, blacklist) === -1) {
		                    $edit.append('<li role="presentation"><a role="menuitem" tabindex="-1" href="/edit/?schema='+ key + '">' + key + '</a></li>');
		                }
		            }
		        );
		    }
		);

})(jQuery);