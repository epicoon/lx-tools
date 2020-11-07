/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

var e1 = new lx.Box({
	geom: [10, 10, 40, 40]
});
e1.fill('green');

var e1 = new lx.Box({
	key: 'bar',
	geom: [20, 20, 40, 40]
});
e1.fill('red');


Snippet.onLoad(()=>{
	console.log(Snippet);
});

