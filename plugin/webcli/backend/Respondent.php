<?php

namespace lx\tools\plugin\webcli\backend;

use lx\CliProcessor;

class Respondent extends \lx\Respondent {

	/**
	 *
	 * */
	public function getCommandList() {
		$processor = new CliProcessor($this->app);
		$list = $processor->getCommandsList();
		unset($list['exit']);

		$list = array_merge([
			'clear_console' => 'clear',
			'auth_manage' => 'auth-manage',
			'models_manage' => 'models-manage',
			], $list
		);

		return $list;
	}

	/**
	 *
	 * */
	public function handleCommand($command, $args, $processParams, $serviceName, $pluginName) {
		$service = null;
		if ($serviceName) {
			try {
				$service = $this->app->getService($serviceName);
			} catch (\Exception $e) {
				return [
					'success' => false,
					'data' => 'Service name is wrong'
				];
			}
		}
		$plugin = null;
		if ($pluginName) {
			try {
				$plugin = $this->app->getPlugin($pluginName);
			} catch (\Exception $e) {
				return [
					'success' => false,
					'data' => 'Plugin name is wrong'
				];
			}
		}

		$processor = new CliProcessor($this->app);
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

	/**
	 *
	 * */
	public function runAuthManage() {
		if (!$this->app->authorizationGate) {
			return [
				'success' => false
			];
		}

		$plugin = $this->app->authorizationGate->getManagePlugin();
		$builder = new \lx\PluginBuildContext($plugin);
		return [
			'success' => true,
			'data' => $builder->build(),
		];
	}

	/**
	 *
	 * */
	public function runModelsManage($serviceName) {
		if (!$this->app->services->exists($serviceName)) {
			return [
				'success' => false,
				'message' => "Service '$serviceName' not found",
			];
		}

		//TODO - отцепить
		$plugin = $this->app->getPlugin('lx/lx-model:modelManager');
		$plugin->addRenderParams([
			'service' => $serviceName
		]);
		$builder = new \lx\PluginBuildContext($plugin);
		return [
			'success' => true,
			'data' => $builder->build(),
		];
	}
}
