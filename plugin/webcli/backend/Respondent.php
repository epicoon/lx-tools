<?php

namespace lx\tools\plugin\webcli\backend;

use lx\CliProcessor;

class Respondent extends \lx\Respondent
{
	public function getCommandList(): array
    {
		$processor = new CliProcessor();
		$list = $processor->getCommandsList()->getSubList([
			CliProcessor::COMMAND_TYPE_COMMON,
			CliProcessor::COMMAND_TYPE_WEB_ONLY,
		]);
		$list->removeCommand('\q');

		return array_merge([
		    [
                'command' => ['clear'],
                'description' => 'Clear console',
            ],
		], $list->toArray());
	}

	public function handleCommand(
	    string $command, 
        string $inputString, 
        array $processParams, 
        string $serviceName, 
        string $pluginName
    ): array
    {
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
        list($__pass, $args) = $processor->parseInput($inputString);
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
