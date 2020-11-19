/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.EggMenu;
#lx:use lx.ActiveBox;
#lx:use lx.TreeBox;


/***********************************************************************************************************************
 * MENU
 **********************************************************************************************************************/
var egg = new lx.EggMenu({
	coords: ['5px', '5px'],
	menuWidget: lx.ActiveBox

	,
	menuRenderer: function(menu) {
		menu->resizer.move({
			parentResize: true,
			xLimit: false,
			yLimit: false
		});
	}
});

var menuBox = egg->menuBox;
var menu = menuBox.add(lx.Box, {key:'menu'});
menu.grid({indent: '10px'});
menu.begin();
	var plugin = new lx.Box({width:12, key:'plugin'});
menu.end();

plugin.align(lx.CENTER, lx.MIDDLE);
plugin.text('Select plugin');
plugin.style('cursor', 'pointer');





/*
var menuRenderer = function(pult) {
	pult->resizer.move({
		parentResize: true,
		xLimit: false,
		yLimit: false
	});
};
#lx:<ml
<lx.EggMenu>(coords:['5px', '5px'], menuWidget:lx.ActiveBox, menuRenderer)
	<lx.Box@menu>.grid(indent: '10px')
		<lx.Box@plugin>(width:12)
			.align(lx.CENTER, lx.MIDDLE)
			.text('Select plugin')
			.style('cursor', 'pointer')

#lx:ml>
/**/





/***********************************************************************************************************************
 * PLUGIN SELECTOR
 **********************************************************************************************************************/
var pluginSelector = new lx.Box({geom:true, key:'pluginSelector'});
pluginSelector.style('z-index', 1000);
pluginSelector.hide();
pluginSelector.begin();
	var back = new lx.Box({geom:true});
	back.fill('black');
	back.opacity(0.5);

	new lx.TreeBox({geom:[25, 20, 50, 50], key:'tree'});
pluginSelector.end();


/*
#lx:<ml
<lx.Box@pluginSelector>(geom:true)
	.style('z-index', 1000)
	.hide()
	<lx.Box>(geom:true).fill('black').opacity(0.5)
	<lx.TreeBox@tree>(geom:[25, 20, 50, 50])
#lx:ml>
/**/

