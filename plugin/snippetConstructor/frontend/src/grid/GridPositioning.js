class GridPositioning extends lxsc.Positioning #lx:namespace lxsc {
	constructor(grid, x0, y0, x1, y1) {
		super();
		this.grid = grid;
		this.x0 = x0;
		this.y0 = y0;
		this.x1 = x1;
		this.y1 = y1;
	}

	actualize() {
		var firstBox = this.grid.getBox(this.x0, this.y0);
		var lastBox = this.grid.getBox(this.x1, this.y1);

		var newW = lastBox.left('px') + lastBox.width('px') - firstBox.left('px');
		var newH = lastBox.top('px') + lastBox.height('px') - firstBox.top('px');
		this.elem.box.left(firstBox.left('px') + 'px');
		this.elem.box.top(firstBox.top('px') + 'px');
		this.elem.box.width(newW + 'px');
		this.elem.box.height(newH + 'px');
	}
}
