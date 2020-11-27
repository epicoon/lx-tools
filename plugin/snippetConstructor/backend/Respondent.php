<?php

namespace lx\tools\plugin\snippetConstructor\backend;

use lx\PackageBrowser;
use lx\Plugin;
use lx\Service;

/**
 * Class Respondent
 * @package lx\tools\plugin\snippetConstructor\backend
 */
class Respondent extends \lx\Respondent
{
    /**
     * @return array
     */
    public function getPluginsList()
    {
        $services = PackageBrowser::getServicesList();

        $result = [];
        foreach ($services as $serviceName => $service) {
            $category = $service->getCategory();
            if (!array_key_exists($category, $result)) {
                $result[$category] = [];
            }

            $serviceData = $this->getPluginsData($service);
            if (!empty($serviceData)) {
                $result[$category][$serviceName] = $serviceData;
            }
        }


        return $result;
    }



    /*******************************************************************************************************************
     * PRIVATE
     ******************************************************************************************************************/

    /**
     * @param Service $service
     * @return array
     */
    private function getPluginsData($service)
    {
        $plugins = $service->getStaticPlugins();
        $serviceData = [];
        foreach ($plugins as $pluginName => $plugin) {
            $pluginData = $this->getSnippetsList($plugin);
            if (!empty($pluginData)) {
                $serviceData[$pluginName] = $pluginData;
            }
        }
        return $serviceData;
    }

    /**
     * @param Plugin $plugin
     * @return array
     */
    private function getSnippetsList($plugin)
    {
        $dirs = $plugin->conductor->getSnippetDirectories();
        $pluginData = [];
        foreach ($dirs as $dir) {
            $pluginData[] = $dir->getName();
        }
        return $pluginData;
    }
}
