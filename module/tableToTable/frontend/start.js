const box = [
	Module->>table0,
	Module->>table1
];

box[0]->add.click(()=> Data.newModel0());
box[0]->del.click(()=> Data.delModel0());
box[0]->filter.on('change', function() {
	Data.actualizeFilter(Data.modelTable0, this.value());
});
box[1]->add.click(()=> Data.newModel1());
box[1]->del.click(()=> Data.delModel1());
box[1]->filter.on('change', function() {
	Data.actualizeFilter(Data.modelTable1, this.value());
});
	
function clickModel() {
	var model = this.parent.matrixModel(),
		index0 = +model.is(Data.Model1),
		index1 = +!index0;
	Data.selectModel(
		model,
		box[index1]->filter.value()
	);
	box[index0]->list.getChildren((a)=>a.key=='suitable', true).each((a)=> a.disabled(true));
	box[index1]->list.getChildren((a)=>a.key=='suitable', true).each((a)=> a.disabled(false));
}

function fieldBlur() {
	if (this.valueChanged())
		Data.updateModel(this.parent.matrixModel(), this._field, this.value());
}

^Resp.getInfo() : (res)=> {
	Data.setInfo(res);

	var disp = new lx.ModelListDisplayer({
		lock: ['id', 'suitable'],
		hide: ['selected'],
		formModifier: (a)=> a.setField('selected', function(val) { this.fill(val ? 'green' : ''); }),
		fieldsModifier: {
			id: (a)=> a.setField('id', function(val) { this.text('#' + val); })
						.align(lx.CENTER, lx.MIDDLE)
						.click(clickModel),
			suitable: (a)=> a.click(function() { Data.checkBond(this.parent.matrixModel()); }),
			default: (a)=> a.on('blur', fieldBlur)
		}
	});

	disp.apply({
		box: box[0]->list,
		modelClass: Data.Model0,
		data: Data.modelTable0.selected
	});

	disp.apply({
		box: box[1]->list,
		modelClass: Data.Model1,
		data: Data.modelTable1.selected
	});
};
