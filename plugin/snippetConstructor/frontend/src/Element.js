class Element #lx:namespace lxsc {
	#lx:const
		IS_NOT_CONTAINER = 0,
		GRID_CONTAINER = 1;

	constructor(box, positioning) {
		if (!positioning) positioning = new lxsc.Positioning();
		this.positioning = positioning;
		this.positioning.elem = this;

		this.box = box;
		this.containerType = self::IS_NOT_CONTAINER;
		this.containerField = null;		
	}

	setGrid() {
		this.containerField = new lxsc.GridField(this);
	}

	actualizeGeom() {
		this.positioning.actualize();
	}

	genCode() {
		
	}
}
