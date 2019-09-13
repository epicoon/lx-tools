#lx:module lx.tools.widget.LanguageSwitcher;

#lx:use lx.Dropbox;

#lx:private;

/**
 * Переключатель языка на основе lx.Dropbox, который хранит настройку языка в куках
 * */
class LanguageSwitcher extends lx.Dropbox #lx:namespace lx.tools.widget {
	/**
	 *
	 * */
	build(config) {
		super.build(config);
		this.options(#lx:php(\lx::$app->language->list));
	}

	#lx:client {
		postBuild(config) {
			super.postBuild(config);
			this.actualizeLang();

			this.on('change', _handler_onChange);
		}

		actualizeLang() {
			var lang = lx.Cookie.get('lang');
			if (lang) {
				this.value(lang);
				return;
			}

			if (this.value() === null) this.select(0);
			lx.Cookie.set('lang', this.value());
		}
	}
}

#lx:client {
	function _handler_onChange() {
		if (lx.Cookie.get('lang') == this.value()) return;
		lx.Cookie.set('lang', this.value());
		location.reload();
	}
}
