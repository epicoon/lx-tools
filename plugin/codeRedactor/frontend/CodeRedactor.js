#lx:use lx.Textarea;

const CodeRedactor = {};

CodeRedactor.langTable = {
	php: 'php',
	js: 'js'
};

CodeRedactor.context = null;
CodeRedactor.colorHighlight = true;

CodeRedactor.auto = true;
CodeRedactor.autoOn = true;
CodeRedactor.hint = true;
CodeRedactor.hintOn = true;
CodeRedactor.hintLen = 1;
CodeRedactor.hintPrevent = false;

CodeRedactor.EVENT_INPUT = 0;
CodeRedactor.EVENT_DELETE = 1;
CodeRedactor.EVENT_EXTRACT = 2;
CodeRedactor.EVENT_PASTE = 3;
CodeRedactor.EVENT_MASSDELETE = 4;

CodeRedactor.eventTimeout = 2000;


CodeRedactor.setEditable = function(el) {
	el.events = cr.eventManager();
	var _c = el.textbox;
	_c.setAttribute('contentEditable','true');
	_c.innerHTML = '<span><br></span>';
	_c.style.whiteSpace = 'pre';
	_c.style.overflow = 'visible';
	el.red = {
		key: null,
		lang: ''
	};
	el->textbox.on('focus', function(event) {
		CodeRedactor.context = el;
		el.red.key = null;
		el.hideHint();
		el.on('keydown', cr.keydown);
		el.on('keyup', cr.keyup);
	});
	el->textbox.on('blur', function(event) {
		el.off('keydown', cr.keydown);
		el.off('keyup', cr.keyup);
		CodeRedactor.context = null;
	});
};

CodeRedactor.genSpans = function(text) {
	// в месте перевода строки может стоять два символа - 13 и 10. 13 - это '\r', 10 не нужен
	text = text.replace( new RegExp(String.fromCharCode(13) + '?' + String.fromCharCode(10), 'g'), String.fromCharCode(13) );

	// разбил по переносам чтобы проще было обернуть пробельные символы
	var boof = text.split(String.fromCharCode(13)),
		ps = cr.lang().pareSymbols;
		
	// обернуть спанами все кроме служебных символов
	for (var i=0, l=boof.length; i<l; i++) {
		// оборачиваются слова
		boof[i] = boof[i].replace( /([\wа-яё\d]+)/gi, '<span>$1</span>' );
		// оборачиваются пробельные символы
		boof[i] = boof[i].replace( /(\s+)/g, '<span>$1</span>' );
	}
	// востанавливаю текст с заменой переносов строк
	boof = boof.join('<span><br></span>');

	// регулярное выражение для отлова парных служебных символов
	var psRe = '(';
	for (var i=0, l=ps.length; i<l; i++) {
		var temp = ps[i];
		temp = temp.replace(/(.)/g, '\\$1');
		if (i) psRe += '|';
		psRe += temp;
	}
	psRe += ')';
	psRe = new RegExp(psRe, 'g');

	// обернуть спанами служебные символы
	function overspan(p, pre, post) {
		var m = p.split(psRe);
		var res = pre;
		for (var i=0, l=m.length; i<l; i++) {
			if (i % 2) {
				res += '<span>' + m[i] + '</span>';
				continue;
			}
			if (m[i] == '') continue;
			for (var j=0, ll=m[i].length; j<ll; j++)
				res += '<span>' + m[i][j] + '</span>';
		}
		res += post;
		return res;
	}
	// если он первый
	boof = boof.replace( /^([^\wа-яё\d\s]+?)<span>/i, function(str, p) { return overspan(p, '', '<span>') });
	// если он последний
	boof = boof.replace( /<\/span>([^\wа-яё\d\s]+?)$/i, function(str, p) { return overspan(p, '</span>', '') });
	// если он гандон
	boof = boof.replace( /<\/span>([^\wа-яё\d\s]+?)<span>/gi, function(str, p) { return overspan(p, '</span>', '<span>'); });

	return boof;
};

CodeRedactor.charType = function(ch) {
	if ( ch == String.fromCharCode(13) ) return NaN;
	if ( ch.match(/[\wа-яё\d]/i) !== null ) return 1;
	if ( ch.match(/\s/) !== null ) return 2;
	return 3;
};

CodeRedactor.newSpan = function(key) {
	var span = document.createElement('span');
	span.innerHTML = (key == String.fromCharCode(13)) ? '<br>' : key;
	span = cr.span(span);

	// история
	cr.events().add(span, cr.EVENT_INPUT, {
		pos: 0,
		amt: key.length
	});

	return span;
};

CodeRedactor.checkTextJoinValid = function(text0, text1) {
	if (text0 == String.fromCharCode(13) || text1 == String.fromCharCode(13) || text0 == '<br>' || text1 == '<br>') return false;
	var type0 = cr.charType(text0[0]),
		type1 = cr.charType(text1[0]);
	if (type0 != type1) return false;
	if (type0 == 3) return ( cr.lang().pareSymbols.indexOf( text0 + text1 ) != -1 );
	return true;
};

CodeRedactor.loading = function(mode) {
	if (!mode) {
		delete cr.loadingInfo;
		return;
	}

	cr.loadingInfo = {
		"'": false,
		'"': false,

		quoteOpened: function() { return (this['"'] || this['\'']); },
		commentCounter: 0,
		commentLine: false,
		commentInc: function() { this.commentCounter++; },
		commentDec: function() { if (this.commentCounter) this.commentCounter--; }
	}
};

CodeRedactor.keydown = function(e) {
	// то, что делается через CTRL
	if (lx.ctrlPressed()) {
		// комментирование
		if (e.key == '/') cr.range().lines().swapComment();

		// обработка вставки - чтобы заспанить вставляемый текст, нужно его перехватиь. Копирование идет стандартным путем, там спаны автоматом улетают
		if (e.keyCode == 86) cr.range().paste();

		// ctrl-z
		if (e.keyCode == 90) cr.events().back();

		return;
	}

	if (cr.context.get('hint').visibility()) {
		if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 27) cr.context.hideHint();
		else if (e.keyCode == 38 || e.keyCode == 40) {
			cr.context.moveHint(e.keyCode);  // вверх 38, вниз 40
			e.preventDefault();
			return;
		}
	}

	// если удален символ
	if (e.keyCode == 8 || e.keyCode == 46) {
		e.preventDefault();
		cr.range().del( e.keyCode );
		return;
	}

	if (e.keyCode == 13 || e.keyCode == 9) { e.preventDefault(); return; }

	if (e.key.length > 1) { this.red.key = null; return; }
	this.red.key = e.key.match( /[\wа-яё\s\d\[\]\(\){}\&\<\>\+\=\-\*\/\\\!\@\#\$\%\^\.\,\:\;\?\'\"\|]/i );

	if (this.red.key !== null) e.preventDefault();
};

CodeRedactor.keyup = function(e) {
	// CTRL тут не нужен
	if (lx.ctrlPressed()) return;
	// управление курсором стрелками тоже не надо
	if (37 <= e.keyCode && e.keyCode <= 40) return;

	// сразу обработаем ситуацию выбора подсказки
	if (cr.context.get('hint').visibility() && e.keyCode == 13) {
		e.preventDefault();
		cr.context.chooseHint();
		return;
	}

	// чтобы оставить энтер
	var key = e.key;
	if (e.keyCode == 13 || e.keyCode == 9) {
		key = (e.keyCode == 13) ? String.fromCharCode(13) : '\t';
		this.red.key = 1;
	}

	// остаются только символы и энтер
	if (key.length > 1) return;
	if (this.red.key == null) return;

	cr.range().addChar( key );
};




//=============================================================================================================================
/* CodeRedactor.eventManager */
/*
для события ввода текста надо сохранять
	- позицию, с которой добавлялись символы
	- количество добавленных символов
событие создания нового спана - частный случай с позицией 0, количеством 1

для события удаления текста надо сохранять
	- удаленный текст
	- позицию
	- способ удаления

событие удаления спана - навешивается на следующий спан (предыдущий, если окружающие спаны слились), надо сохранить:
	- текст в удаленном спане
	- имя удаленного спана
	- позиция, если окружающие спаны слились
	- имя следующего, если окружающие спаны слились

событие вставки текста
	- узел next, перед которым все вставлено
	- offset, если последний узел вставки слился с next
	- pre если есть
	- offset для pre, если pre есть

событие удаления фрагмента текста, надо
	- текст без спанов
	- имена спанов
	- текст, вырезанный из первого граничного спана
	- текст, вырезанный из последнего граничного спана
	- событие вешается на спан next (pre если спаны слились)
	- если было слияние pre и next, то preLen
	- имя next, если спаны слились
	- порядок первого и последнего выделенных - для восстановления каретки
*/


CodeRedactor.event = function(tp, i, name) {
	return {
		spanId: name || cr.events().genId(),
		type: tp,
		info: i,

		span: function() { return cr.span( document.getElementsByName(this.spanId)[0] ); },

		inputBack: function() {
			var s = this.span();
			if (this.info.pos == 0 && this.info.amt == s.len()) {
				s.extract();
				return;
			}
			var text = s.text();
			text = text.substr(0, this.info.pos) + text.substr(this.info.pos + this.info.amt);
			s.text(text);
			cr.range().setCaret(s, this.info.pos);
		},

		deleteBack: function() {
			var s = this.span(),
				offset = (this.info.way==0) ? this.info.pos : this.info.pos - this.info.text.length;
			var text = s.text();
			text = text.substr(0, offset) + this.info.text + text.substr(offset);
			s.text(text);
			cr.range().setCaret(s, this.info.pos);
		},

		extractBack: function() {
			var s = this.span(),
				span;
			if (this.info.offset !== undefined) {
				var spans = s.split(this.info.offset);
				if (this.info.nextName) spans[1].span.setAttribute('name', this.info.nextName);
				span = spans[0].insertNext(this.info.text);
				if (this.info.name) span.span.setAttribute('name', this.info.name);
			} else {
				span = s.insertPre(this.info.text);
				if (this.info.name) span.span.setAttribute('name', this.info.name);
			}
			cr.range().setCaret(span, span.len());
		},

		pasteBack: function() {
			if (this.spanId == this.info.pre) {
				var s = this.span(),
					text = s.text();
				s.text( text.substr(0, this.info.preOffset) + text.substr(this.info.nextOffset) );
				cr.range().setCaret(s, this.info.preOffset);
				return;
			}

			var next = this.span(),
				pre = (this.info.pre) ? cr.span(document.getElementsByName(this.info.pre)[0]) : null,
				arr = [],
				offset = 0;
			for (var p = next.pre(); p && !p.equal(pre); p=p.pre()) arr.push(p);
			for (var i=0, l=arr.length; i<l; i++) arr[i].del();

			if (this.info.nextOffset)
				next.text( next.text().substr(this.info.nextOffset) );
			if (pre) {
				next = pre;
				offset = this.info.preOffset;
				if (this.info.preOffset < pre.len()) pre.text( pre.text().substr(0, this.info.preOffset) );
				pre.joinNext();
			}
			cr.range().setCaret(next, offset);
		},

		massdelBack: function() {
			var s = this.span();
			var next, pre,
				nextOffset = 0, preOffset;
			if (this.info.names === undefined) {
				pre = s;
				next = s;
				preOffset = this.info.offset;
				nextOffset = preOffset + this.info.text.length;
				s.text( s.text().substr(0, this.info.offset) + this.info.text + s.text().substr(this.info.offset) );
			} else {
				next = s;
				if ( this.info.preLen !== undefined ) {
					var spans = s.split( this.info.preLen );
					pre = spans[0];
					next = spans[1];
					if ( this.info.nextName !== null ) next.span.setAttribute('name', this.info.nextName);
				} else pre = next.pre();

				if (pre) {
					preOffset = pre.len();
					if (this.info.preText !== undefined) pre.text( pre.text() + this.info.preText );
				} else {
					pre = cr.context.textbox.childNodes[0];
					preOffset = 0;
				}
				if (this.info.nextText !== undefined) {
					nextOffset = this.info.nextText.length;
					next.text( this.info.nextText + next.text() );
				}
				var boof = document.createElement('span');
				boof.innerHTML = cr.genSpans(this.info.text);
				for (var i=0, l=boof.childNodes.length; i<l; i++) {
					var span = next.insertPre( boof.childNodes[i].innerHTML );
					if (this.info.names[i] !== null) span.span.setAttribute('name', this.info.names[i]);
				}
			}
			if (preOffset == pre.len()) { pre = pre.next(); preOffset = 0; }
			if (this.info.seq) cr.range().setCaret(pre, preOffset, next, nextOffset);
			else cr.range().setCaret(next, nextOffset, pre, preOffset);  // это так не работает
		},

		restore: function() {
			cr.events().off();
			cr.autoOn = false;
			switch (this.type) {
				case cr.EVENT_INPUT: this.inputBack(); break;
				case cr.EVENT_DELETE: this.deleteBack(); break;
				case cr.EVENT_EXTRACT: this.extractBack(); break;
				case cr.EVENT_PASTE: this.pasteBack(); break;
				case cr.EVENT_MASSDELETE: this.massdelBack(); break;
			}
			cr.autoOn = cr.auto;
			cr.events().on();
		}
	};
};

CodeRedactor.eventManager = function() {
	return {
		idCounter: 0,
		data: [],
		available: 1,

		active: null,
		start: 0,

		on: function() { this.available++; },
		off: function() { this.available--; },

		reset: function() {
			this.active = null;
			this.start = 0;
		},

		genId: function() {
			var id = this.idCounter;
			this.idCounter++;
			return 'e' + id;
		},

		getName: function(span) {
			if ( span.span.getAttribute('name') !== null ) return;
			span.span.setAttribute('name', this.genId());
		},

		len: function() { return this.data.length },

		last: function() { return this.data[ this.len() - 1 ]; },

		addNewEvent: function(span, type, info, act) {
			var e = cr.event(type, info, span.span.getAttribute('name'));
			if (!span.span.getAttribute('name')) span.span.setAttribute('name', e.spanId);

			// сохраняю 50 последних событий, больше вряд ли нужно
			if (this.data.length > 50) this.data.shift();
			this.data.push(e);
			if (act) {
				this.active = e;
				this.start = (new Date).getTime();
			} else this.reset();

			return e;
		},

		addEvInput: function(span, info) {
			if (this.checkActive(span, cr.EVENT_INPUT))
				this.active.info.amt += info.amt;
			else
				this.addNewEvent(span, cr.EVENT_INPUT, info, true);
		},

		addEvDelete: function(span, info) {
			var act = this.checkActive(span, cr.EVENT_DELETE, info);

			if (!act) this.addNewEvent(span, cr.EVENT_DELETE, info, true);
			else {
				var e = this.active;
				if (info.way == 0) e.info.text += info.text;
				else e.info.text = info.text + e.info.text;
			};
		},

		checkActive: function(span, type, info) {
			if (this.active === null) return false;
			var e = this.active,
				res = (
					e.type == type &&
					e.span().equal(span) &&
					(new Date).getTime() - this.start < cr.eventTimeout
				);
			if (type == cr.EVENT_INPUT) return res;
			if (type == cr.EVENT_DELETE) return (res && e.info.way == info.way);
		},

		add: function(span, type, info) {
			if (this.available != 1) return;
			switch (type) {
				case cr.EVENT_INPUT: this.addEvInput(span, info); break;
				case cr.EVENT_DELETE: this.addEvDelete(span, info); break;
				case cr.EVENT_EXTRACT:
				case cr.EVENT_PASTE:
				case cr.EVENT_MASSDELETE: this.addNewEvent(span, type, info); break;
			};
		},

		back: function() {
			if (!this.data.length) return;
			this.reset();
			var e = this.data.pop();
			e.restore();
		}

	};
};

CodeRedactor.events = function() { return cr.context.events; };
/* CodeRedactor.eventManager */
//=============================================================================================================================




//=============================================================================================================================
/* CodeRedactor.span */
CodeRedactor.span = function(s) {
	return {
		span: s,
		lx: function() {
			if (this.span.lx === undefined) this.span.lx = {};
			return this.span.lx;
		},
		text: function(t) {
			if (t !== undefined) {
				this.span.innerHTML = t;
				cr.marker.check(this);
				return;
			}
			if (this.span.innerHTML == '<br>') return String.fromCharCode(13);
			return this.span.innerHTML;
		},
		len: function() {
			if (this.text() == String.fromCharCode(13)) return 0;
			if (this.text() == '&lt;') return 1;
			if (this.text() == '&gt;') return 1;
			if (this.text() == '&amp;') return 1;
			if (this.text() == '&amp;&amp;') return 2;
			return this.text().length;
		},
		name: function() {
			return this.span.getAttribute('name');
		},
		equal: function(s) {
			if (s === null) return false;
			return (this.span === s.span);
		},
		checkCaret: function(offset) {
			var r = cr.range();
			if (!r.isCaret()) return false;

			// если оффсет не передан, вернет оффсет, если он есть на этом спане, иначе false
			if (offset === undefined) {
				if (this.equal(r.anchor)) return r.anchorOffset;
				var pre = this.pre();
				if (!pre) return false;
				if (pre.equal(r.anchor) && pre.len() == r.anchorOffset) return 0;
			}

			// если оффсет передан, проверит именно эту позицию
			if (!offset) {
				var pre = this.pre();
				if (!pre) return false;
				if (pre.equal(r.anchor) && pre.len() == r.anchorOffset) return true;
			}
			if (!this.equal(r.anchor)) return false;
			if (offset == r.anchorOffset) return true;
			return false;
		},
		setText: function(text, shift) {  // сам следит за кареткой
			if (shift === undefined) shift = 0;
			var offset = this.checkCaret();
			this.text(text);
			if (offset !== false) cr.range().setCaret(this, offset + shift);
		},
		checkJoin: function(span) {
			span = span || this.next();
			if (!span) return false;
			return cr.checkTextJoinValid( this.text(), span.text() );
		},
		joinNext: function() {
			if ( !this.checkJoin() ) return false;
			var next = this.next();
			this.setText( this.text() + next.text() );
			next.del();
			return this;
		},
		split: function(pos) {  // как инструмент вне истории
			cr.events().off();
			var span = this.insertNext( this.span.innerHTML.substr(pos) );
			this.span.innerHTML = this.span.innerHTML.substr(0, pos);
			cr.events().on();
			return [this, span];
		},
		del: function() {  // скидывает каретку на предыдущий спан, если нужно
			cr.context.hideHint();

			var isQuote = this.isQuote(),
				isCommentQuote = this.isCommentQuote();

			var next = this.next(),
				r = cr.range(), node;
			if (this.equal(r.anchor)) node = this.next();
			this.span.parentElement.removeChild(this.span);
			if (node) r.setCaret(node, 0);

			if (isQuote) cr.marker.actualizeStringStyles(next);
			else if (isCommentQuote !== false) cr.marker.commentSpanDeleted(isCommentQuote, next);
		},
		extract: function() {  // отличается от del() - не просто удаляет, но и объединит оказавшиеся соседями спаны, если это возможно
			var info = {
				text: this.text(),
				name: this.span.getAttribute('name'),
				nextName: this.next().span.getAttribute('name')
			};

			var pre = this.pre(),
				next = this.next();
			this.del();
			if (pre) {
				var len = pre.len();
				if (pre.joinNext()) info.offset = len;
			}

			if (info.offset === undefined) pre = next;
			cr.events().add(pre, cr.EVENT_EXTRACT, info);
		},

		clearColor: function() {
			if (!cr.colorHighlight) return;
			if (this.span.style.backgroundColor == '') return;
			this.span.style.backgroundColor = '';
			var pre = this.pre();
			if (pre) pre.span.style.backgroundColor = '';
		},
		resetStyle: function() {
			var str = this.span.classList.contains( cr.style(cr.STRINGS) ),
				com = this.span.classList.contains( cr.style(cr.COMMENT) );
			this.span.className = '';
			this.clearColor();
			if (str) this.span.classList.add( cr.style(cr.STRINGS) );
			if (com) this.span.classList.add( cr.style(cr.COMMENT) );
		},
		addStyle: function(st) {
			this.span.classList.add(st);
		},
		delStyle: function(st) {
			this.span.classList.remove(st);
		},
		toggleStyle: function(st, bool) {
			this.span.classList.toggle(st, bool);
		},
		hasStyle: function(st) {
			return this.span.classList.contains(st);
		},
		comment: function(bool) {
			if ( this.isCommentQuote() !== false ) return;
			if (!this.span.lx) this.span.lx = { commentCounter: 0, commentLine: false };
			if (bool === undefined) this.span.lx.commentCounter++;
			else this.span.lx.commentLine = true;
			this.addStyle( cr.style(cr.COMMENT) );
		},
		uncomment: function(bool) {
			if (!this.span.lx || (!this.span.lx.commentCounter && !this.span.lx.commentLine)) return;
			if (bool === undefined) this.span.lx.commentCounter--;
			else this.span.lx.commentLine = false;
			if (!this.span.lx.commentCounter && !this.span.lx.commentLine)
				this.delStyle( cr.style(cr.COMMENT) );
		},
		string: function(bool) {
			this.lx().inString = bool;
			this.toggleStyle( cr.style(cr.STRINGS), bool );
		},


		next: function() {
			var next = this.span.nextElementSibling;
			if (!next) return null;
			return cr.span(next);
		},
		pre: function() {
			var pre = this.span.previousElementSibling;
			if (!pre) return null;
			return cr.span(pre);
		},
		insertPre: function(key) {
			var span = cr.newSpan(key);
			this.span.parentElement.insertBefore( span.span, this.span );
			cr.marker.check(span);
			if ( span.len() && this.checkCaret(0) )  // не нужно менять каретку если был добавлен переход на новую строку
				cr.range().setCaret( span, span.len() );
			return span;
		},
		insertNext: function(key) {
			var span = cr.newSpan(key),
				next = this.next();
			if (next === null) this.span.parentElement.appendChild(span.span);
			else this.span.parentElement.insertBefore(span.span, next.span);
			cr.marker.check(span);
			if ( this.checkCaret(this.len()) ) {
				if (!span.len()) cr.range().setCaret( span.next(), 0 );  // опять из-за энтера замут
				else cr.range().setCaret( span, span.len() );
			}
			return span;
		},
		insertIn: function(key, offset) {
			var caret = this.checkCaret();
			var spans = this.split(offset),
				spliter = spans[1].insertPre(key);
			cr.marker.check( spans[0] );
			cr.marker.check( spans[1] );
			if (caret) cr.range().setCaret(spliter, 1);
			return [ spans[0], spliter, spans[1] ];
		},

		EOL: function() {
			return (this.span.innerHTML == '<br>');
		},
		isCommentQuote: function(type) {
			var index = cr.lang().commentQuotes.indexOf(this.text());
			if (index == -1) return false;
			if (type === undefined) return index;
			return (index == type);
		},
		isQuote: function() {
			var index = cr.lang().strings.indexOf(this.text());
			if (index == -1) return false;
			return cr.lang().strings[index];
		},
		type: function() {
			if (this.span.innerHTML == '<br>') return 2;
			return cr.charType(this.span.innerHTML[0]);
		},

		preText: function(text) {
			for (var pre=this.pre(); pre && pre.text()!=text; pre=pre.pre()) {}
			return pre;
		},
		inString: function() {
			return this.span.classList.contains( cr.style(cr.STRINGS) );
		},

		preString: function() {
			var pre = this.pre();
			if (!pre) return false;
			if (pre.lx().inString) return pre.lx().inString;
			if (pre.lx().open) return pre.isQuote();
			return false;
		},
		nextWordSpan: function() {
			for (var temp=this.next(); temp && temp.type()==2; temp=temp.next()) {}
			return temp;
		},
		preWordSpan: function() {
			for (var pre=this.pre(); pre && pre.type()==2; pre=pre.pre()) {}
			return pre;
		},

		addChar: function(key, offset) {
			// типы совпадают
			if (cr.checkTextJoinValid(this.text(), key) || cr.checkTextJoinValid(key, this.text())) {
				// разборки с историей
				cr.events().add(this, cr.EVENT_INPUT, {
					pos: offset,
					amt: key.length
				});

				var text = this.text();
				this.setText( text.substr(0, offset) + key + text.substr(offset), 1 );
				return;
			}

			// offset == 0 только в начале строки, слить символ в предыдущий спан не выйдет, т.к. это бр-спан. Остается только добавлять новый
			if (offset == 0) this.insertPre(key);
			// добавляем символ в конец - или слить в следующий спан, или добавить новый спан после текущего
			else if (offset == this.len()) {
				var next = this.next();
				if ( next && cr.checkTextJoinValid(key, next.text()) ) next.addChar(key, 0);
				else this.insertNext(key);
			// разбиваем текущий спан новым
			} else this.insertIn(key, offset);
		},

		delChar: function(offset, shift) {
			if (shift === undefined) shift = 0;
			offset += shift;
			var l = this.len();
			if (offset > l) return false;
			// наводка на предыдущий спан
			if (offset == -1) {
				var pre = this.pre(),
					len = pre.len();
				if (len) pre.delChar(len - 1);
				else pre.extract(); // \r
			// наводка на следующий спан
			} else if (offset == l) {
				var next = this.next(),
					len = next.len();
				if (len) next.delChar(0);
				else next.extract();  // \r
			// длина говорит о том, что спан будет удален
			} else if (l < 2) {
				this.extract();
			// собственно удаление символа
			} else {
				// разборки с историей
				cr.events().add(this, cr.EVENT_DELETE, {
					text: this.text()[offset],
					pos: offset - shift,
					way: shift
				});

				var isCommentQuote = this.isCommentQuote();
				this.setText(this.span.innerHTML.substr(0, offset) + this.span.innerHTML.substr(offset+1), shift);
				if (isCommentQuote !== false) cr.marker.commentSpanDeleted(isCommentQuote, this.next());
			}
		}
	}
};
/* CodeRedactor.span */
//=============================================================================================================================




//=============================================================================================================================
/* CodeRedactor.line */
CodeRedactor.line = function(span) {
	if (span.span !== undefined) span = span.span;
	for (var pre=span; pre && pre.innerHTML!='<br>'; pre=pre.previousElementSibling) {}
	return {
		first: pre ? cr.span(pre.nextElementSibling) : cr.span(span.parentElement.childNodes[0]),
		indent: function() {
			if ( this.first.text()[0] == ' ' || this.first.text()[0] == '\t' ) return this.first.text();
			else return '';
		},
		firstWordSpan: function() {
			if ( this.first.text()[0] == ' ' || this.first.text()[0] == '\t' ) return this.first.next();
			else return this.first;
		},

		next: function() {
			for (var next=this.first; next && next.text()!=String.fromCharCode(13); next=next.next()) {}
			if (!next) return null;
			for (var n=next; n && n.text()==String.fromCharCode(13); n=n.next()) {}
			if (!n) return null;
			return cr.line(n);
		},

		commented: function() {
			if ( this.first.text() == '/'+'/' ) return true;
			if ( (this.first.text()[0] == ' ' || this.first.text()[0] == '\t') && this.first.next().text() == '/'+'/' ) return true;
			return false;
		},
		comment: function(indent) {
			var span;
			if (!indent || indent == this.indent().length) {
				var f = this.firstWordSpan();
				span = f.insertPre('/'+'/');
			} else {
				var spans = this.first.insertIn('/'+'/', indent);
				this.first = spans[0];
				span = spans[1];
			}
		},
		uncomment: function() {
			var first = this.firstWordSpan();
			var sp = first.next();
			if (sp.text() == ' ') sp.extract();
			else if (sp.len() > 1 && sp.text()[0] == ' ' && sp.text()[1] == '\t')
				sp.span.innerHTML = sp.text().substr(1);
			first.extract();
		},
		swapComment: function() {
			this.commented() ? this.uncomment() : this.comment();
		}
	}
};
/* CodeRedactor.line */
//=============================================================================================================================




//=============================================================================================================================
/* CodeRedactor.lines */
CodeRedactor.lines = function(arr) {
	return {
		list: arr,
		minIndent: function() {
			var res = Infinity;
			for (var i=0, l=this.list.length; i<l; i++) {
				var indentL = this.list[i].indent().length;
				if (res > indentL) res = indentL;
			}
			return res;
		},
		commented: function() {
			for (var i=0, l=this.list.length; i<l; i++)
				if (!this.list[i].commented()) return false;
			return true;
		},
		comment: function() {
			var minIndent = this.minIndent();
			for (var i=0, l=this.list.length; i<l; i++) this.list[i].comment(minIndent);
		},
		uncomment: function() {
			for (var i=0, l=this.list.length; i<l; i++) this.list[i].uncomment();
		},
		swapComment: function() {
			this.commented() ? this.uncomment() : this.comment();			
		}
	}
};
/* CodeRedactor.lines */
//=============================================================================================================================




//=============================================================================================================================
/* CodeRedactor.range */
CodeRedactor.range = function() {
	var obj = {
		reset: function() {
			var sel = document.getSelection();
			this.selection = sel;
			// проверка для бр-спанов
			var s0 = sel.anchorNode,
				s1 = sel.focusNode;
			if ( s0.parentElement !== cr.context.textbox ) s0 = s0.parentElement;
			if ( s1.parentElement !== cr.context.textbox ) s1 = s1.parentElement;
			this.anchor = cr.span(s0);
			this.focus = cr.span(s1);
			this.anchorOffset = sel.anchorOffset;
			this.focusOffset = sel.focusOffset;
		},

		isCaret: function() {
			return ( this.anchor.span === this.focus.span && this.anchorOffset == this.focusOffset );
		},

		rightSequens: function() {
			if (this.anchor.span === this.focus.span) return (this.anchorOffset <= this.focusOffset);
			if ( this.anchor.span.offsetTop < this.focus.span.offsetTop
			|| (this.anchor.span.offsetTop == this.focus.span.offsetTop && this.anchor.span.offsetLeft < this.focus.span.offsetLeft) )
				return true;
			return false;
		},

		edges: function() {
			if ( this.rightSequens() ) return [ this.anchor, this.focus, this.anchorOffset, this.focusOffset ];
			return [ this.focus, this.anchor, this.focusOffset, this.anchorOffset ];
		},

		allSpans: function() {
			if (this.anchor.span === this.focus.span) return [this.anchor];
			var edges = this.edges(),
				result = [];
			for (var temp=edges[0]; temp.span!==edges[1].span; temp=temp.next())
				result.push( temp );
			result.push( edges[1] );
			return result;
		},

		lines: function() {
			if (this.anchor.span === this.focus.span) return cr.lines([ cr.line(this.anchor) ]);
			var edges = this.edges(),
				result = [ cr.line(edges[0]) ];
			for (var temp=edges[0]; temp.span!==edges[1].span; temp=temp.next())
				if (temp.text() == String.fromCharCode(13) && temp.next().text() != String.fromCharCode(13))
					result.push( cr.line(temp.next()) );
			return cr.lines(result);
		},



		caretOnStart: function() {
			return ((this.anchorOffset == 0 && this.anchor.pre() == null)
					|| (this.focusOffset == 0 && this.focus.pre() == null));
		},

		caretOnEnd: function() {
			function end(s, offset) { return (offset == s.len() && (s.next() === null || s.next().next() === null)); };
			return ( end(this.anchor, this.anchorOffset) || end(this.focus, this.focusOffset) );
		},

		setCaret: function(span, offset, span1, offset1) {
			if (offset > span.len()) {
				console.log('LX: offset('+offset+') is larger then span.length('+span.len()+')');
				offset = span.len();
			}

			var r = document.createRange();
			r.setStart(span.span.childNodes[0], offset);

			if (span1 === undefined) r.collapse();
			else r.setEnd(span1.span.childNodes[0], offset1);

			this.selection.removeAllRanges();
			this.selection.addRange(r);
		},

		delRange: function() {
			var edges = this.edges();

			// сначала самое простое - все в перделах одного спана
			if ( edges[0].equal(edges[1]) ) {
				// вышли на удаление спана
				if (edges[2] == 0 && edges[3] == edges[0].len()) {
					edges[0].extract();
					return;
				}
				// просто текст из середины спана вырезан
				text = edges[0].text().substr( edges[2], edges[3] - edges[2] );
				edges[0].text( edges[0].text().substr(0, edges[2]) + edges[0].text().substr(edges[3]) );
				cr.events().add(edges[0], cr.EVENT_MASSDELETE, {
					text: text,
					offset: edges[2],
					seq: this.rightSequens()
				});
				this.setCaret(edges[0], edges[2]);
				return;
			}

			var spans = this.allSpans(),
				pre = edges[0],
				next = edges[1],
				start = 1,
				finish = spans.length-1,
				text = '',
				names = [],
				sequens = this.rightSequens(),
				offset = 0;

			// если первый спан с нулевой позиции - он будет удален
			if ( edges[2] == 0 ) {
				start = 0;
				pre = pre.pre();
				if (pre) edges[2] = pre.len();
			}

			// если последний спан с конечной позиции, он будет удален
			if ( edges[3] == next.len() ) {
				next = next.next();
				edges[3] = 0;
				finish++;
			}

			// удалим все промежуточные спаны
			cr.events().off();
			for (var i=start; i<finish; i++) {
				text += spans[i].text();
				names.push(spans[i].name());
				spans[i].del();
			}
			text = text.replace(/&lt;/g, '<');
			text = text.replace(/&gt;/g, '>');
			text = text.replace(/&amp;/g, '&');

			var info = { text: text, names: names, seq: sequens };
			if (next.len()) {
				info.nextText = next.text().substr( 0, edges[3] );
				next.span.innerHTML = next.span.innerHTML.substr(edges[3]);
			}
			if (pre) {
				if (pre.len()) {
					info.preText = pre.text().substr( edges[2] );
					pre.span.innerHTML = pre.span.innerHTML.substr(0, edges[2]);
				}
				var name = next.name(),
					len = pre.len();
				if (pre.joinNext()) {
					info.nextName = name;
					info.preLen = len;
					next = pre;
					offset = len;
				}
			}
			cr.events().on();
			cr.events().add( next, cr.EVENT_MASSDELETE, info );
			this.setCaret(next, offset);
		},

		del: function(key) {
			// ключ нужен только для каретки, range удаляется одинаково и 8 и 46
			if (this.isCaret()) {
				if (key == 8 && this.caretOnStart() ) return;
				if (key == 46 && this.caretOnEnd() ) return;
				this.anchor.delChar( this.anchorOffset, (key==8)?-1:0 );
			} else this.delRange();
		},

		addChar: function(key) {
			if (this.isCaret()) {
				this.anchor.addChar(key, this.anchorOffset);
			} else {
				this.del();
				this.reset();
				this.addChar(key);
			}
		},

		pasteText: function(text) {
			cr.autoOn = false;
			if (this.isCaret()) {
				var next;

				if (this.anchorOffset == 0)
					next = this.anchor;
				else if (this.anchorOffset == this.anchor.len())
					next = this.anchor.next();
				else {
					this.setCaret(this.anchor.split(this.anchorOffset)[1], 0);
					this.reset();
					this.pasteText(text);
					return;
				}

				text = cr.genSpans(text);
				var boof = document.createElement('span');
				boof.innerHTML = text;

				// чтобы поспаново в историю не писалось
				cr.events().off();
				// для истории
				var info = {
					pre: null,
					preOffset: 0,
					nextOffset: 0
				};

				// первый узел идет на попытку слияния с имеющимся в тексте
				var temp = next.insertPre( boof.childNodes[0].innerHTML ),
					pre = temp.pre();
				if (pre) {
					info.preOffset = pre.len();
					if (pre.joinNext()) temp = pre;
					cr.events().getName(pre);
					info.pre = pre.name();
				}

				// вставляем остальные узлы
				for (var i=1, l=boof.childNodes.length; i<l; i++)
					temp = next.insertPre( boof.childNodes[i].innerHTML );

				// последний узел идет на попытку слияния с имеющимся в тексте
				var offset = temp.len();
				if (temp.joinNext()) {
					info.nextOffset = offset;
					next = temp;
				}
				// каретка ставится в конец вставленного фрагмента
				this.setCaret(temp, offset);

				// включить историю обратно
				cr.events().on();
				cr.events().add(next, cr.EVENT_PASTE, info);
			} else {
				this.del();
				this.reset();
				this.pasteText(text);
			}
			cr.autoOn = cr.auto;
		},

		paste: function() {
			var _t = this,
				span = _t.anchor,
				offset = _t.anchorOffset;
			_t.selection.removeAllRanges();

			lx.Textarea({style: {opacity: 0}})
				.focus()
				.addEventListener('keyup', function() {
					_t.setCaret(span, offset);
					var text = this.value();
					this.del();
					_t.pasteText(text);
				});
		}


	}
	obj.reset();
	return obj;
};
/* CodeRedactor.range */
//=============================================================================================================================




CodeRedactor.COMMENT_OPEN = 0;
CodeRedactor.COMMENT_CLOSE = 1;
CodeRedactor.COMMENT_LINE = 2;




//=============================================================================================================================
/* CodeRedactor.lang */

CodeRedactor.RESERVED = 0;
CodeRedactor.SPECIAL = 1;
CodeRedactor.SYMBOLS = 2;
CodeRedactor.FUNCTIONS = 3;
CodeRedactor.CONSTRUCTORS = 4;
CodeRedactor.VARIABLE = 5;
CodeRedactor.NUMERIC = 6;
CodeRedactor.CONSTANT = 7;
CodeRedactor.STRINGS = 8;
CodeRedactor.COMMENT = 9;

CodeRedactor.marker = {
	init: function(info) {
		for (var i in info) this[i] = info[i];
	},

	checkToColor: function(span) {
		if (!cr.colorHighlight) return;
		var text = span.text();
		if (text.length == 6 && !isNaN(parseInt(text, 16))) {
			var pre = span.pre();
			if ( pre && pre.text() == '#' ) {
				span.span.style.backgroundColor = '#' + text;
				pre.span.style.backgroundColor = '#' + text;
			}
		}
	},

	styleType: function(span) {
		var text = span.text(),
			lang = cr.lang();

		if ( text.isNumber ) return cr.NUMERIC;
		if ( text == '.' && span.pre().text().isNumber && span.next().text().isNumber ) return cr.NUMERIC;
		if ( span.isCommentQuote() !== false ) return cr.COMMENT;
		if ( span.isQuote() ) return cr.STRINGS;
		if ( lang.symbols.indexOf(text) != -1 || lang.pareSymbols.indexOf(text) != -1 ) return cr.SYMBOLS;
		if ( lang.reserved.indexOf(text) != -1 ) return cr.RESERVED;
		if ( lang.special.indexOf(text) != -1 ) return cr.SPECIAL;

		// функции и конструкторы
		var next = span.next();
		if (next && next.text() == '(') {
			var pre = span.pre();
			if (pre && pre.text() == 'new') return cr.CONSTRUCTORS;
			return cr.FUNCTIONS;
		}

		var result = lang.check(span);

		return result;
	},

	actualizeStringStyles: function(first) {
		for (var next=first; next; next=next.next()) {
			var isQuote = next.isQuote(),
				preString = next.preString();
			if (!isQuote) next.string( preString );
			else if (isQuote) {
				if (!preString) {
					delete next.lx().inString;
					next.lx().open = true;
				} else if (isQuote == preString) {
					delete next.lx().inString;
					next.lx().open = false;
				} else {
					delete next.lx().open;
					next.lx().inString = preString;
				}
			}
		}
	},

	checkString: function(span) {
		var isQuote = span.isQuote(),
			preString = span.preString();

		// имеем дело не с кавычкой - просто проверяем не в строку ли пишется новый узел
		if (!isQuote) {
			if (preString) span.string(preString);
			return;
		}

		// если кавычка оказалась внутри другой кавычки
		if (preString && preString != isQuote) {
			span.lx().inString = preString;
			return;
		}

		if (!preString) {
			span.lx().open = true;
			// автодобавление второй кавычки
			if (cr.autoOn) {
				var next = span.next();
				if (next && (!next.len() || next.type() == 2)) {
					span.insertNext(isQuote);
					return;
				}
			}
		} else {  // (preString == isQuote)
			span.lx().open = false;
			// чтобы при автодобавлении предотвратить цикл актуализации
			if (cr.autoOn && span.pre().isQuote() == isQuote) return;
		}

		this.actualizeStringStyles( span.next() );
	},

	commentSpanDeleted: function(quote, next) {
		if (quote == cr.COMMENT_LINE)
			for (var n=next; n.len(); n=n.next()) n.uncomment(true);
		else if (quote == cr.COMMENT_OPEN)
			for (var n=next; n && !n.isCommentQuote(cr.COMMENT_CLOSE); n=n.next()) n.uncomment();
		else if (quote == cr.COMMENT_CLOSE) {
			var pre = next.pre();
			if (pre && pre.isCommentQuote() === false && pre.lx().commentCounter)
				for (var n=next; n && !n.isCommentQuote(cr.COMMENT_CLOSE); n=n.next()) n.comment();
		}
	},

	checkComment: function(span) {
		var isComment = span.isCommentQuote();

		// если имеем дело со знаком комментирования
		if (isComment !== false) {
			if (isComment == cr.COMMENT_LINE)
				for (var next=span.next(); next.len(); next=next.next()) next.comment(true);
			else if (isComment == cr.COMMENT_OPEN)
				for (var next=span.next(); next && !next.isCommentQuote(cr.COMMENT_CLOSE); next=next.next()) next.comment();
			else if (isComment == cr.COMMENT_CLOSE) {
				var pre = span.pre();
				if (pre && pre.isCommentQuote() === false && pre.lx().commentCounter)
					for (var next=span.next(); next && !next.isCommentQuote(cr.COMMENT_CLOSE); next=next.next()) next.uncomment();
			}
			delete span.lx().commentCounter;
			delete span.lx().commentLine;
		// остальное надо проверять - не в комментарий ли пишется новый узел
		} else {
			var comm = 0, line = false;
			for (var pre=span.pre(); pre; pre=pre.pre()) {
				if ( pre.isCommentQuote(cr.COMMENT_CLOSE) ) comm--;
				else if ( pre.isCommentQuote(cr.COMMENT_OPEN) ) comm++;
				else if ( pre.isCommentQuote(cr.COMMENT_LINE) ) line = true;
				else {
					if (pre.lx().commentCounter) comm += pre.lx().commentCounter;
					if (pre.len() && pre.lx().commentLine) line = true;
					break;
				}
			}
			if (comm < 0) comm = 0;
			if (comm || line) {
				span.addStyle( cr.style(cr.COMMENT) );
				span.lx().commentCounter = comm;
				span.lx().commentLine = line;
			}
		}
	},

	// автодополнение скобок
	autoBracket: function(span) {
		if ( span.text() == '(' ) { span.insertNext(')'); return true; }
		if ( span.text() == '[' ) { span.insertNext(']'); return true; }
		if ( span.text() == '{' ) { span.insertNext('}'); return true; }
		return false;
	},

	// сохранение табуляции при добавлении новой строки
	autoSpace: function(span) {
		if ( span.len() ) return false;

		var pre = span.pre();
		if (!pre) return false;

		var line = cr.line(pre),
			indent = line.indent();

		// если открыта скобка
		if (pre.text() == '{' || pre.text() == '(') {
			// особый случай - операторные скобки
			if (pre.text() == '{' && span.next().text() == '}') {
				if (indent !== '') span.insertNext(indent);
				span.insertNext(String.fromCharCode(13));
			}
			indent += '\t';
		// иначе надо проверить первое слово
		} else {
			var word = line.firstWordSpan().text(),
				arr = ['if', 'for', 'while'];
			if (arr.indexOf(word) != -1) indent += '\t';
		}

		if (indent !== '') {
			var next = span.insertNext(indent);
			cr.range().setCaret( next, next.len() );
		}
		return true;
	},

	autoHint: function(span) {
		if (!cr.hint) return false;
		if (!cr.hintOn) return false;
		if (cr.hintPrevent) {
			cr.hintPrevent = false;
			return false;
		}
		if (span.type() != 1) return false;
		if (span.len() < cr.hintLen) return false;

		var slash = String.fromCharCode(92);
		var text = span.text(),
			cod = cr.context.getText(),
			re = new RegExp(slash+'b'+text+'['+slash+'w'+slash+'d]*?'+slash+'b', 'g'),
			boof = cod.match(re),
			arr = [],
			empty = true;

		if (!boof) return false;
		for (var i=0, l=boof.length; i<l; i++) {
			if ( boof[i] == text ) continue;
			arr[ boof[i] ] = 1;
			empty = false;
		}
		if (empty) return false;

		var s = span.span,
			l = s.offsetLeft,
			t = s.offsetTop + s.offsetHeight;
		boof = [];
		for (var i in arr) boof.push(i);
		cr.context.showHint(l, t, boof);

		return true;
	},

	autoActions: function(span) {
		if (this.autoBracket(span)) return;
		if (this.autoSpace(span)) return;

		if (!this.autoHint(span)) cr.context.hideHint();
	},

	check: function(span) {
		span.resetStyle();

		var st = this.styleType( span );
		if (st != -1) span.addStyle( cr.style(st) );

		this.checkString(span);
		this.checkComment(span);

		this.checkToColor(span);

		// некоторые автоматизмы
		if (cr.autoOn) this.autoActions(span);
	},

	loadingCheck: function(span) {
		var st = this.styleType( span );
		if (st != -1) span.addStyle( cr.style(st) );

		var isCommentQuote = span.isCommentQuote();
		if (isCommentQuote === cr.COMMENT_LINE) cr.loadingInfo.commentLine = true;
		else if (isCommentQuote === cr.COMMENT_OPEN) cr.loadingInfo.commentInc();
		else if (isCommentQuote === cr.COMMENT_CLOSE) cr.loadingInfo.commentDec();
		else if ( cr.loadingInfo.commentCounter || cr.loadingInfo.commentLine ) {
			span.addStyle( cr.style(cr.COMMENT) );
			span.lx().commentCounter = cr.loadingInfo.commentCounter;
			span.lx().commentLine = cr.loadingInfo.commentLine;
		}
		if (!span.len()) cr.loadingInfo.commentLine = false;

		var opened = span.preString(),
			isQuote = span.isQuote();
		if (isQuote && (!opened || opened == isQuote)) {
			cr.loadingInfo[isQuote] = !cr.loadingInfo[isQuote];
			span.lx().open = cr.loadingInfo[isQuote];
		} else if (cr.loadingInfo.quoteOpened()) {
			span.string(opened);
		}
	}
};

CodeRedactor.langName = function() {
	if ( cr.context === null ) return '';
	return cr.context.lang;
};

CodeRedactor.lang = function() {
	return cr.langs[ cr.langName() ];
};

CodeRedactor.style = function(type) {
	return cr.lang().styles[type];
};

CodeRedactor.langs = {
	php: {
		type: 'php',

		styles: [
			'lxcr-php-rsv', /* RESERVED */
			'lxcr-php-spc', /* SPECIAL */
			'lxcr-php-smb', /* SYMBOLS */
			'lxcr-php-fnc', /* FUNCTIONS */
			'lxcr-php-cns', /* CONSTRUCTORS */
			'lxcr-php-var', /* VARIABLE */
			'lxcr-php-nmr', /* NUMERIC */
			'lxcr-php-cst', /* CONSTANT */
			'lxcr-php-str', /* STRINGS */
			'lxcr-php-cmt'  /* COMMENT */
		],

		reserved: [
			'require_once', 'return', 'if', 'else', 'elseif', 'new', 'class',
			'const', 'extends', 'private', 'public', 'protected',
			'for', 'foreach', 'continue', 'do', 'while'
		],

		special: [],

		symbols: [ '+', '*', '-', '/', '!', '@', '.', '&lt;', '&gt;', '=' ],
		pareSymbols: [ '/'+'*', '*'+'/', '/'+'/', '===', '==', '||', '&&', '&amp;&amp;', '++', '--', '::' ],

		strings: [ '"', '\'' ],

		commentQuotes: [
			/*open*/ '/'+'*',
			/*close*/ '*'+'/',
			/*line*/ '/'+'/'
		],

		check: function(span) {
			// переменные, начинающиеся с $
			if (span.text() == '$') return cr.VARIABLE;
			
			var pre = span.pre();
			if (pre && pre.text() == '$' && span.type() == 1) return cr.VARIABLE;
			// все для них же - если пропала связь с $
			if (pre && pre.text() == '$' && span.type() != 1) cr.marker.check(span.next());
			// объявление класса
			if (pre && pre.pre() && pre.pre().text() == 'class') return cr.FUNCTIONS;

			var next = span.next();
			// Классы, у которых вызвана статика
			if (next && next.text() == '::') return cr.FUNCTIONS;

			// все что не переменная в php - константа
			if (span.type() == 1) return cr.CONSTANT;
			return -1;
		}
	},

	js: {
		type: 'js',

		styles: [
			'lxcr-js-rsv', /* RESERVED */
			'lxcr-js-spc', /* SPECIAL */
			'lxcr-js-smb', /* SYMBOLS */
			'lxcr-js-fnc', /* FUNCTIONS */
			'lxcr-js-cns', /* CONSTRUCTORS */
			'lxcr-js-var', /* VARIABLE */
			'lxcr-js-nmr', /* NUMERIC */
			'lxcr-js-cst', /* CONSTANT */
			'lxcr-js-str', /* STRINGS */
			'lxcr-js-cmt'  /* COMMENT */
		],

		reserved: ['new', 'return', 'if', 'else', 'class', 'extends', 'var', 'let', 'const'],

		special: ['lx', 'this'],

		symbols: [ '+', '*', '-', '/', '!', '&lt;', '&gt;', '=' ],
		pareSymbols: [ '/'+'*', '*'+'/', '/'+'/', '===', '==', '=&lt', '||', '&&', '&amp;&amp;', '++', '--' ],

		strings: [ '"', '\'' ],

		commentQuotes: [
			/*open*/ '/'+'*',
			/*close*/ '*'+'/',
			/*line*/ '/'+'/'
		],

		check: function(span) {
			return -1;
		}
	}
};
/* CodeRedactor.lang */
//=============================================================================================================================

var cr = CodeRedactor;

/*
Осталось добить:
- перегрузить ctrl+s, ctrl+r (уже в общей структуре)
- поиск, массовый поиск, автозамена
- на for сделать шаблон. Вообще реализовать шаблоны как массив-словарь для каждого языка, чтобы можно было шаблоны делать свои. Они будут показываться на ввод в поле автодополнения слова
*/


/* CodeRedactor */
//=============================================================================================================================