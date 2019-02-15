<?php
/**
 * @var Module $Module
 * @var Block $Block
 * */

$Block->fill('white');

$Block->addBlock('tab', [
	'key' => 'table0',
	'width' => 50,
], [
	'title' => 'Table: \"' . $Module->params->table0 . '\"'
]);

$Block->addBlock('tab', [
	'key' => 'table1',
	'left' => 50,
], [
	'title' => 'Table: \"' . $Module->params->table1 . '\"'
]);
