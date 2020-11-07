/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

var e1 = new lx.Box({
	geom: [30, 30, 40, 40]
});
e1.fill('blue');

var e1 = new lx.Box({
	key: 'bar',
	geom: [50, 50, 40, 40]
});
e1.fill('yellow');


Snippet.onLoad(()=>{
	console.log(Snippet);
});

