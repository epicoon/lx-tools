<?php

namespace lx\tools;

class Service extends \lx\Service {
	public function renderBlock($name, $config = [], $renderParams = [], $clientParams = []) {
		if (!isset($config['key'])) {
			$config['key'] = str_replace('/', '_', $name);
		}

		return \lx\Block::render([
			'config' => $config,
			'path' => $this->getPath() . '/blocks/' . $name,
			'renderParams' => $renderParams,
			'clientParams' => $clientParams
		]);
	}
}
