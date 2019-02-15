class TableModel {
	constructor(modelClass) {
		this.modelClass = modelClass;
		this.map = [];
		this.table = [];
		this.selected = new lx.Collection();
		this.currentFilter = self::FILTER_ALL;
		this.active = null;
	}

	set(info) {
		info.each((a)=> {
			var model = new this.modelClass(a);
			this.map[model.id] = model;
			this.table.push(model);
			this.selected.add(model);
		});
	}

	add(id) {
		var model = new this.modelClass({id});
		model.id = id;
		this.map[model.id] = model;
		this.table.push(model);
		this.selected.add(model);
	}

	del(model) {
		if (model === this.active) this.setActive(null);
		delete this.map[model.id];
		this.table.remove(model);
		this.selected.remove(model);
	}

	setActive(model=null) {
		if (this.active) {
			if (this.active === model) return;
			this.active.selected = false;
			this.active = null;
		}

		if (model === null) return;

		model.selected = true;
		this.active = model;
	}

	reset() {
		this.setActive(null);
		this.selected.clear();
	}

	setFilter(filter, model) {
		if (filter === undefined) filter = this.currentFilter;
		this.currentFilter = filter;

		if (model === null) return;

		this.reset();

		switch (filter) {
			case self::FILTER_ALL:
				this.table.each((a)=> this.selected.add(a));
				break;
			case self::FILTER_SUITABLE:
				this.table.each((a)=> { if (a.bonds.contain(model.id)) this.selected.add(a); });
				break;
			case self::FILTER_NOT_SUITABLE:
				this.table.each((a)=> { if (!a.bonds.contain(model.id)) this.selected.add(a); });
				break;
		}
	}
}

TableModel.FILTER_ALL = 0;
TableModel.FILTER_SUITABLE = 1;
TableModel.FILTER_NOT_SUITABLE = 2;
