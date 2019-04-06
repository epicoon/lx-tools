<?php
/**
 * @var Module $Module
 * @var Block $Block
 * */

$Block->style('z-index', 1000);
$Block->overflow('auto');

$fon = new lx\Rect([ 'style' => ['fill' => 'black', 'opacity' => 0.5] ]);
$fon->style('position', 'fixed');

$inputPopupStream = new lx\Box([ 'key' => 'stream', 'geom' => ['30%', '40%', '40%', '0%'] ]);
$inputPopupStream->fill('white');
$inputPopupStream->border();
$inputPopupStream->roundCorners('8px');
$inputPopupStream->stream(['indent' => '10px', 'sizeBehavior' => lx\StreamPositioningStrategy::SIZE_BEHAVIOR_BY_CONTENT]);

$inputPopupStream->begin();
	(new lx\Box(['key' => 'message']))->align(\lx::CENTER, \lx::MIDDLE);

	$buttons = new lx\Box(['key' => 'buttons', 'height' => '35px']);
	$buttons->grid(['step' => '10px', 'cols' => 2]);
	new lx\Button(['parent' => $buttons, 'key' => 'yes', 'width' => 1, 'text' => lx::i18n('Yes')]);
	new lx\Button(['parent' => $buttons, 'key' => 'no', 'width' => 1, 'text' => lx::i18n('No')]);
$inputPopupStream->end();

$Block->hide();
