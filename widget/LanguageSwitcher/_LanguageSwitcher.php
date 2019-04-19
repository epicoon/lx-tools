<?php

namespace lx\tools\widget;

use lx\Dropbox;

/**
 * Переключатель языка на основе lx\Dropbox, который хранит настройку языка в куках
 * */
class LanguageSwitcher extends Dropbox {
	const DEFAULT_AJAX = false;

	public function __construct($config = []) {
		parent::__construct($config);

		$this->addClass('lx-Dropbox');
		$language = \lx::$components->language;
		$this->options($language->list);
		$this->value($language->current);

		if (isset($config['ajax'])) {
			$this->ajaxMode = $config['ajax'];
		} elseif (self::DEFAULT_AJAX) {
			$this->ajaxMode = self::DEFAULT_AJAX;
		}
	}

	public static function ajaxGetMap($names) {
		return 'response: NOTHING, SORRY';
	}

	protected static function ajaxMethods() {
		return [
			'ajaxGetMap',
		];
	}
}
