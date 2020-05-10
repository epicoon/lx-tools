/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.Button;

App.useI18n({service: 'lx/tools'});

Snippet.onload(()=>{#lx:require onclient;});

Snippet.widget.setGeom(['0%', '0%', '100%', '100%']);
Snippet.widget.style('z-index', 1000);
Snippet.widget.style('position', 'fixed');
Snippet.widget.overflow('auto');

new lx.Rect({geom:true, style: {fill:'black', opacity:0.5}});

var inputPopupStream = new lx.Box({key:'stream', geom:['30%', '40%', '40%', '0%']});
inputPopupStream.fill('white');
inputPopupStream.border();
inputPopupStream.roundCorners('8px');
inputPopupStream.stream({indent:'10px'});

inputPopupStream.begin();
	var buttons = new lx.Box({key:'buttons', height:'35px'});
	buttons.grid({step:'10px', cols:2});
	new lx.Button({parent:buttons, key:'ok', width:1, text:#lx:i18n(OK)});
	new lx.Button({parent:buttons, key:'close', width:1, text:#lx:i18n(Close)});
inputPopupStream.end();

Snippet.widget.hide();
