/**
 * @var lx.Application App
 * @var lx.Plugin Plugin
 * @var lx.Snippet Snippet
 * */

new lx.Box({
	key: 'redactor',
	css: 'lxcr-back',
	style: {overflow: 'auto'},
	geom: true
});

Plugin.clientParams.text = Plugin.renderParams.text;
Plugin.clientParams.lang = Plugin.renderParams.lang;
