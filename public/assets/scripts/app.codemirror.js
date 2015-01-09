var codeMirror = require('codemirror/lib/codemirror');

require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/selection/active-line');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/json-lint');

codeMirror.options = {
	styleActiveLine: true,
	lineNumbers: true,
	matchBrackets: true,
	autoCloseBrackets: true,
	lineWrapping: true,
	viewportMargin: Infinity,
	mode: 'application/json',
	gutters: ['CodeMirror-lint-markers'],
	lint: true
}

module.exports = codeMirror;