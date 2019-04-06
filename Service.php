<?php

namespace lx\tools;

use lx\ModuleBuilder;

class Service extends \lx\Service {
	public function renderBlock($name, $config = [], $renderParams = [], $clientParams = []) {
		if (!isset($config['key'])) {
			$config['key'] = str_replace('/', '_', $name);
		}

		\lx::useI18n('lx/lx-tools');

		return \lx\Block::render([
			'config' => $config,
			'path' => $this->getPath() . '/block/' . $name,
			'renderParams' => $renderParams,
			'clientParams' => $clientParams
		]);
	}
}
