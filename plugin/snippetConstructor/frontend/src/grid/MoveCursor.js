#lx:private;

class MoveCursor #lx:namespace lxsc {
	constructor(grid, elem) {
		this.grid = grid;
		this.elem = elem;
		this.box = null;
	}

	move(event) {
		__move(this, event, true);
	}

	resize(event) {
		__move(this, event, false);
	}
}

function __move(self, event, move) {
	var moveConfig = move
		? {parentMove: true}
		: {parentResize: true};
	var boxConfig = move
		? {
			geom: ['5px', '5px', '20px', '20px'],
			css: 'lxsc-movebut'
		}
		: {
			geom: [null, null, '20px', '20px', '5px', '5px'],
			css: 'lxsc-resizebut'
		};

	self.box = new lx.Box({
		parent: self.elem.box.parent,
		geom: true,
		css: 'lxsc-movecursor'
	});
	self.box.copyGeom(self.elem.box);

	var moveBut = self.box.add(lx.Box, boxConfig);
	moveBut.move(moveConfig);
	lx.move.call(moveBut, event);

	moveBut.__moveCursor = self;
	moveBut.on('move', __onMove)
	moveBut.on('moveEnd', __onMoveEnd);
}

function __onMove(e) {
	var bar = this.parent;
	var x0 = bar.left('px'),
		y0 = bar.top('px'),
		x1 = bar.left('px') + bar.width('px'),
		y1 = bar.top('px') + bar.height('px');
	var cursor = this.__moveCursor;
	cursor.grid.actualizeElementGeom(cursor.elem, x0, y0, x1, y1);
}

function __onMoveEnd(e) {
	var cursor = this.__moveCursor;
	this.off('mouseup', __onMoveEnd);
	delete this.__moveCursor;
	cursor.box.del();
	cursor.box = null;
	cursor.elem = null;
}
