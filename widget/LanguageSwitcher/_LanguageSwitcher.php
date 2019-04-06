<?php

namespace lx\tools\widget;

use lx\Dropbox;

/**
 * Переключатель языка на основе lx\Dropbox, который хранит настройку языка в куках
 * */
class LanguageSwitcher extends Dropbox {
	public function __construct($config = []) {
		parent::__construct($config);

		$this->addClass('lx-Dropbox');
		$this->options(\lx::$language->list);
		$this->value(\lx::$language->current);
	}
}
