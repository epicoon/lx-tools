<?php

namespace lx\tools\plugin\webcli\backend;

use lx\CliProcessor;

class Respondent extends \lx\Respondent {

	public function getCommandList() {
		$processor = new CliProcessor();
		$list = $processor->getCommandsList([
			CliProcessor::COMMAND_TYPE_COMMON,
			CliProcessor::COMMAND_TYPE_WEB_ONLY,
		]);
		unset($list['exit']);

		return array_merge([
			'clear_console' => 'clear',
		], $list);
	}

	public function handleCommand($command, $args, $processParams, $serviceName, $pluginName) {
		$service = null;
		if ($serviceName) {
			$service = $this->app->getService($serviceName);
			if (!$service) {
				return [
					'success' => false,
					'data' => 'Service name is wrong'
				];
			}
		}
		$plugin = null;
		if ($pluginName) {
			$plugin = $this->app->getPlugin($pluginName);
			if (!$plugin) {
				return [
					'success' => false,
					'data' => 'Plugin name is wrong'
				];
			}
		}

		$processor = new CliProcessor();
		$processor->setParams($processParams);
		$result = $processor->handleCommand($command, $args, $service, $plugin);

		$resService = $processor->getService();
		$resPlugin = $processor->getPlugin();
		$result['service'] = $resService ? $resService->name : null;
		$result['plugin'] = $resPlugin ? $resPlugin->name : null;

		return [
			'success' => true,
			'data' => $result
		];
	}
}
