#lx:require @core/js/classes/css/CssContext;

var cssList = new lx.CssContext();


cssList.addClass('lxsc-hlgc', {
	opacity: 0.66
}, {
	hover: {
		backgroundColor: 'yellow'
	}
});

cssList.addClass('lxsc-delbut', {
	cursor: 'pointer',
	backgroundColor: 'red'
});

cssList.addClass('lxsc-movebut', {
	cursor: 'pointer',
	backgroundColor: 'green'
});

cssList.addClass('lxsc-resizebut', {
	cursor: 'pointer',
	backgroundColor: 'green'
});

cssList.addClass('lxsc-movecursor', {
	border: 'dotted blue 2px'
});

return cssList.toString();
