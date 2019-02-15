<?php
/**
 * @var lx\Module $Module
 * @var lx\Block $Block
 * @var $title
 * */

$Block->grid([
	'sizeBehavior' => lx\GridPositioningStrategy::SIZE_BEHAVIOR_PROPORTIONAL_CONST,
	'cols' => 2,
	'rows' => 20,
	'indent' => '10px'
]);

$b = new lx\Box([ 'text' => $title ]);
$b->align(\lx::CENTER, \lx::MIDDLE);

new lx\Button([ 'key' => 'add', 'text' => 'add', 'width' => 1 ]);
new lx\Button([ 'key' => 'del', 'text' => 'del', 'width' => 1 ]);

new lx\RadioGroup([
	'key' => 'filter',
	'cols' => 3,
	'labels' => [
		'all',
		'suitable',
		'not suitable'
	]
]);

new lx\Box([
	'key' => 'list',
	'height' => 17,
	'style' => ['border' => '']
]);
