const Data = {
	modelTable0: null,
	modelTable1: null,
	bond: [],

	/**
	 * Формирование данных при получении сведений от сервера
	 * */
	setInfo(info) {
		// Модели для таблиц, которые должны быть связаны
		class ModelBase extends lx.BindableModel{
			constructor(data) {
				super(data);
				this.bonds = [];
			}
		}

		// Модель для первой таблицы
		class Model0 extends ModelBase{}
		Model0.initSchema(info[0].lxMerge({
			selected: 'boolean',
			suitable: 'boolean'
		}));
		this.Model0 = Model0;

		// Модель для второй таблицы
		class Model1 extends ModelBase{}
		Model1.initSchema(info[1].lxMerge({
			selected: 'boolean',
			suitable: 'boolean'
		}));
		this.Model1 = Model1;

		// Управляющие сущности для массивов моделей
		this.modelTable0 = new TableModel(Model0);
		this.modelTable1 = new TableModel(Model1);
		this.modelTable0.set(info[2]);
		this.modelTable1.set(info[3]);

		// Восстановление связей
		this.setBond(info[4]);
	},

	setBond(list) {
		list.each((a)=> {
			var id0 = a.id0,
				id1 = a.id1;
			this.modelTable0.map[id0].bonds.push(id1);
			this.modelTable1.map[id1].bonds.push(id0);
		});
	},

	contrTable(tab) {
		if (tab === this.modelTable0) return this.modelTable1;
		return this.modelTable0;
	},

	selectModel(model, filter) {
		if (model.is(this.Model0)) this.selectModel0(model, filter);
		else this.selectModel1(model, filter);
	},

	selectModel0(model, filter) {
		this.modelTable0.setActive(model);
		this.actualizeFilter(this.modelTable1, filter);

		this.modelTable1.table.each((a)=> a.suitable = false);
		this.modelTable0.active.bonds.each((a)=> this.modelTable1.map[a].suitable = true);
	},

	selectModel1(model, filter) {
		this.modelTable1.setActive(model);
		this.actualizeFilter(this.modelTable0, filter);

		this.modelTable0.table.each((a)=> a.suitable = false);
		this.modelTable1.active.bonds.each((a)=> this.modelTable0.map[a].suitable = true);
	},

	actualizeFilter(table, filter) {
		table.setFilter(filter, this.contrTable(table).active);
	},

	checkBond(model) {
		if (model.id === undefined) return;

		var activeTable = model.is(this.Model1)
			? this.modelTable0
			: this.modelTable1,
			contrTable = this.contrTable(activeTable),
			active = activeTable.active,
			index = active.bonds.indexOf(model.id),
			id0, id1;

		if (model.is(this.Model1)) {
			id1 = model.id;
			id0 = active.id;
		} else {
			id0 = model.id;
			id1 = active.id;
		}

		if (index == -1) {
			active.bonds.push(model.id);
			model.bonds.push(active.id);
			^Resp.addBond(id0, id1);
		} else {
			active.bonds.remove(model.id);
			model.bonds.remove(active.id);
			^Resp.delBond(id0, id1);
		}
	},

	updateModel(model, field, value) {
		var request = model.is(this.Model0)
			? 'Resp/updateTable0'
			: 'Resp/updateTable1';
		Module.callToRespondent(request, [model.id, field, value]);
	},

	newModel0() {
		^Resp.addTable0() : (id)=> {
			this.modelTable0.add(id);
			this.actualizeFilter(this.modelTable0);
		};
	},

	delModel0() {
		if (!this.modelTable0.active) return;
		^Resp.delTable0(this.modelTable0.active.id) : ()=> {
			this.modelTable0.del(this.modelTable0.active);
			this.actualizeFilter(this.modelTable0);
		};
	},

	newModel1() {
		^Resp.addTable1() : (id)=> {
			this.modelTable1.add(id);
			this.actualizeFilter(this.modelTable1);
		};
	},

	delModel1() {
		if (!this.modelTable1.active) return;
		^Resp.delTable1(this.modelTable1.active.id) : ()=> {
			this.modelTable1.del(this.modelTable1.active);
			this.actualizeFilter(this.modelTable1);
		};
	}
};
