/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

#lx:require -R src/;

/*
1. Сначала выбрать плагин, только потом строить сниппет
*/


const menu = Snippet->>menu;
const pluginSelector = Snippet->>pluginSelector;


// Не самое красивое доопределение виджета
// menu~>pult->resizer.move({
// 	parentResize: true,
// 	xLimit: false,
// 	yLimit: false
// });
menu.parent.parent.size('400px', '250px');


pluginSelector->tree.setLeafConstructor(function(leaf) {

	console.log(leaf);

});
menu->plugin.click(()=>{

	^Respondent.getPluginsList().then((res)=>{

		console.log(res);

	});

	// var tree = new lx.Tree('a', 'b', 'c', 'a/a');
	// pluginSelector.show();
	// pluginSelector->tree.setData(tree);
});








// var ab = new lx.ActiveBox({
// 	header: 'Some snippet',
// 	geom: true
// });
// var box = ab.add(lx.Box, {
// 	geom: true
// });

// var elem = new lxsc.Element(box);
// elem.setGrid();





