#lx:use lx.Table;

#lx:require CodeRedactor;

var redactor = Plugin->redactor;

redactor.init = function(lang) {
	this.lang = lang;

	this.activeHint = -1;
	this.textbox = (new lx.Box({
		key: 'textbox',
		parent: this,
		style: {padding: '5px'},
		// left: '30px'  //todo - добавить нумерацию строк
	})).getDomElem();

	cr.setEditable(this);

	var h = this.textbox.childNodes[0].offsetHeight;
	this.add(lx.Table, {
		cols: 1,
		key: 'hint',
		size: ['240px', h*8+'px']
	}).hide()
		.style('color', 'black')
		.border({width: 0})
		.setRowsHeight(h+'!px')
		.setRowsCount(2);
};

/**
 * Заливаем текст в элемент и прогоняем на проверку подсветки
 * */
redactor.setText = function(text) {
	cr.context = this;
	var _c = this.textbox;

	_c.innerHTML = cr.genSpans(text) + '<span><br></span>';

	cr.loading(true);
	for (var i=0, l=_c.children.length; i<l; i++) {
		cr.marker.loadingCheck(cr.span( _c.children[i] ));
	}
	cr.loading(false);
	cr.context = null;
};

/**
 * Получить текст, убрав все тэги подсветки
 * */
redactor.getText = function() {
	var str = this.textbox.innerHTML;

	str = str.replace(/<span.*?>/g, '');
	str = str.replace(/<\/span>/g, '');
	str = str.replace(/<br>$/, '');
	str = str.replace(/<br>/g, lx.EOL);

	str = str.replace(/&lt;/g, '<');
	str = str.replace(/&gt;/g, '>');
	str = str.replace(/&amp;/g, '&');

	return str;
};

redactor.selectHint = function(num) {
	var hint = this->hint;
	if ( this.activeHint != -1 ) hint.row(this.activeHint).removeClass('lxcr-hint');
	this.activeHint = num;
	if ( this.activeHint != -1 ) hint.row(this.activeHint).addClass('lxcr-hint');
};

redactor.showHint = function(l, t, info) {
	var hint = this->hint;
	hint.show();
	hint.coords( l+'px', t+'px' );

	hint.setRowsCount(0);
	hint.setRowsCount(info.length);
	hint.rows().each((row)=> {
		row.on('mouseover', ()=>redactor.selectHint(row.index));
		row.on('mousedown', ()=> redactor.chooseHint());
	});

	hint.setContent(info, true);
	this.selectHint(0);
};

redactor.hideHint = function() {
	this.selectHint(-1);
	this->hint.hide();
};

redactor.moveHint = function(dir) {
	if (dir == 38 && this.activeHint)
		this.selectHint( this.activeHint - 1 );
	else if (dir == 40 && this.activeHint < this->hint.rowsCount() - 1)
		this.selectHint( this.activeHint + 1 );
};

redactor.chooseHint = function() {
	if (this.activeHint == -1) return;

	var text = this->hint.cell(this.activeHint, 0).text(),
		r = cr.range(),
		s = r.anchor;

	cr.events().reset();
	cr.events().add(s, cr.EVENT_INPUT, {
		pos: s.len(),
		amt: text.length
	});

	cr.hintPrevent = true;
	r.anchor.setText(text);
	r.setCaret(s, s.len());

	this.hideHint();
};


redactor.init(Plugin.attributes.lang || 'js');
redactor.setText(Plugin.attributes.text || '');
