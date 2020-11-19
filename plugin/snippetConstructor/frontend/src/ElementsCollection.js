class ElementsCollection #lx:namespace lxsc {
	constructor() {
		this.list = [];
	}

	add(elem) {
		this.list.push(elem);
	}

	del(elem) {
		this.list.remove(elem);
	}

	each(func) {
		this.list.each(func);
	}
}
