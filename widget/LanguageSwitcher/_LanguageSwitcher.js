/**
 * Переключатель языка на основе lx.Dropbox, который хранит настройку языка в куках
 * */
class LanguageSwitcher extends lx.Dropbox #lx:namespace lx.tools.widget {
	#lx:const DEFAULT_AJAX = lx\tools\widget\LanguageSwitcher::DEFAULT_AJAX;

	/**
	 *
	 * */
	build(config) {
		super.build(config);
		this.addClass('lx-Dropbox');
		this.options(#lx:php(\lx::$components->language->list));
		this.ajaxMode = config.ajax || self::DEFAULT_AJAX;
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
		lx.Cookie.set('lang', this.value());
	}

	/**
	 *
	 * */
	static onChange() {
		if (lx.Cookie.get('lang') == this.value()) return;
		lx.Cookie.set('lang', this.value());

		if (this.ajaxMode) {
			var names = [];
			lx.modules.each((module)=>names.push(module.name));
			^self::ajaxGetMap(names):(res)=>{
				//todo - трудность с переводами-шаблонами, в которых подменяются какие-то метки на вычисляемые в процессе рендериинга значения
				console.log('TODO ajax mode');
				console.log(names);
				console.log(res);
			};

		} else {
			location.reload();
		}
	}
}
