class GridCursor #lx:namespace lxsc {
	#lx:const
		MODE_NONE = 0,
		MODE_SELECT = 1;

	constructor(grid) {
		this.mode = self::MODE_NONE;
		this.grid = grid;
		this.anchorFirst = null;
		this.anchorLast = null;
		this.elem = null;
	}

	isSelectioning() {
		return this.mode == self::MODE_SELECT;
	}

	setAnchor(box) {
		this.anchorFirst = box;
		this.mode = self::MODE_SELECT;

		var elemBox = new lx.Box({parent: this.grid.container, geom: [0, 0, 0, 0]});
		elemBox.fill(this.grid.preElemColor);
		var positioning = new lxsc.GridPositioning(this.grid, box.column, box.row, box.column, box.row);
		this.elem = new lxsc.Element(elemBox, positioning);
		this.elem.actualizeGeom();
	}

	actualize(box) {
		if (this.mode == self::MODE_NONE) return;

		this.anchorLast = box;
		this.elem.positioning.x0 = Math.min(this.anchorFirst.column, this.anchorLast.column);
		this.elem.positioning.x1 = Math.max(this.anchorFirst.column, this.anchorLast.column);
		this.elem.positioning.y0 = Math.min(this.anchorFirst.row, this.anchorLast.row);
		this.elem.positioning.y1 = Math.max(this.anchorFirst.row, this.anchorLast.row);
		this.elem.actualizeGeom();
	}

	collapse() {
		if (this.mode == self::MODE_NONE) return;

		this.grid.addElement(this.elem);

		this.elem = null;
		this.anchorFirst = null;
		this.anchorLast = null;
		this.mode = self::MODE_NONE;
	}
}
