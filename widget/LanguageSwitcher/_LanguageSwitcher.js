/**
 * Переключатель языка на основе lx.Dropbox, который хранит настройку языка в куках
 * */
class LanguageSwitcher extends lx.Dropbox #lx:namespace lx.tools.widget {
	/**
	 *
	 * */
	build(config) {
		super.build(config);

		this.addClass('lx-Dropbox');

		this.options(#lx:load @lxData/languages);
	}

	/**
	 *
	 * */
	postBuild(config) {
		super.postBuild(config);
		this.actualizeLang();

		this.on('change', self::onChange);
	}

	/**
	 *
	 * */
	actualizeLang() {
		if (!this.value()) this.select(0);

		var lang = lx.Cookie.get('lang');
		if (!lang) {
			lx.Cookie.set('lang', this.value());
		}
	}

	/**
	 *
	 * */
	static onChange() {
		lx.Cookie.set('lang', this.value());
		location.reload();
	}
}
