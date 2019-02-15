<?php

namespace lx\tools;

class Service extends \lx\Service {
	public function renderBlock($name, $config = [], $renderParams = [], $clientParams = []) {
		if (!isset($config['key'])) {
			// слэши заменяются, т.к. в имени задается путь и может их содержать, а ключ должен быль одним словом 
			$config['key'] = str_replace('/', '_', $name);
		}
		$class = (isset($config['widget']))
			? $config['widget']
			: \lx\Box::class;
		$block = new $class($config);

		$block->setBlock([
			'path' => $this->conductor->getPath() . '/blocks/' . $name,
			'renderParams' => $renderParams,
			'clientParams' => $clientParams
		]);
		return $block;
	}
}
