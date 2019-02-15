let onEnterCallback = null;

let onEnter = function() {
	if (onEnterCallback) {
		var values = [];
		if (Block->stream.contain('r')) {
			var rows = Block->stream->r;
			if (rows) {
				if (!rows.isArray) rows = [rows];
				rows.each((a)=> values.push(a->input.value()));
			}
		}
		if (values.len == 1) values = values[0];
		if (onEnterCallback.isFunction) onEnterCallback(values);
		else if (onEnterCallback.isArray)
			onEnterCallback[1].call(onEnterCallback[0], values);
	} 
	Block.close();
};

let onEscape = function() {
	Block.close();
};

Block.open = function(captions, defaults, callback) {
	if (!captions.isArray) captions = [captions];
	if (defaults.isFunction) {
		callback = defaults;
		defaults = {};
	}

	var buttons = this->stream->buttons;

	this->stream.del('r');
	captions.each((caption)=>{
		var row = new lx.Box({
			key: 'r',
			before: buttons
		});
		row.gridProportional({ step: '10px', cols: 2 });

		var textBox = row.add(lx.Box, {
			text : caption,
			width: 1
		});
		textBox.align(lx.CENTER, lx.MIDDLE);
		var input = row.add(lx.Input, {
			key: 'input',
			width: 1
		});
		if (defaults[caption] !== undefined) input.value(defaults[caption]);

		row.height( textBox->text.height('px') + 10 + 'px' );
	});

	var top = (this.height('px') - this->stream.height('px')) * 0.5;
	if (top < 0) top = 0;
	this->stream.top(top + 'px');

	this.show();
	onEnterCallback = callback;

	lx.keydown(13, onEnter);
	lx.keydown(27, onEscape);

	var rows = this->stream->r;
	if (rows.isArray) rows[0]->input.focus();
	else rows->input.focus();
};

Block.close = function() {
	this.hide();

	lx.keydownOff(13, onEnter);
	lx.keydownOff(27, onEscape);
	onEnterCallback = null;
};

Block->>ok.click(onEnter);
Block->>close.click(()=> Block.close());
