[Russian version (Русская версия)](https://github.com/epicoon/lx-tools/blob/master/README-ru.md)

## Service `lx-tools` for lx-platform

It contains widgets and blocks extending the basic set.

Content:
* Widgets
	* [LanguageSwitcher](#w-LanguageSwitcher)
* Blocks
	* [confirmPopup](#b-confirmPopup)
	* [inputPopup](#b-inputPopup)

<a name="w-LanguageSwitcher"><h3>Widget `LanguageSwitcher`</h3></a>
This is switcher of current language based on lx\Dropbox. It holds language setting in cookie. Full widget name with namespace for server side is `lx\tools\widget\LanguageSwitcher`, for client side is `lx.tools.widget.LanguageSwitcher`.<br>
As languages list it uses language array defined by file `lx/data/languages.php`.<br>
Ajax switching mode is in planing, not implemented yet.<br>
Example:
```php
// Define switcher in PHP code. Configiration is standart for dropbox.
$widget = new lx\tools\widget\LanguageSwitcher($config);
```
```js
// Define switcher in JS code. Configiration is standart for dropbox.
let widget = new lx.tools.widget.LanguageSwitcher(config);
```

<a name="b-confirmPopup"><h3>Block `confirmPopup`</h3></a>
This block is modal window. It may be opened with some question to comfirm.<br>
Example:
```php
// Import this block in module view code
$tools = lx::getService('lx/lx-tools');
$tools->renderBlock('confirmPopup');
```
```js
// Use it on the client side
Module->confirmPopup.open(
	question,  // The text for the question to confirm
	callback   // The function to be executed in the case of confirm
);
```

<a name="b-inputPopup"><h3>Block `inputPopup`</h3></a>
This block is modal window. It may be opened with set of parameters to be entered by keyboard.<br>
Example:
```php
// Import this block in module view code
$tools = lx::getService('lx/lx-tools');
$tools->renderBlock('inputPopup');
```
```js
// Use it on the client side
Module->inputPopup.open(
	paramNames,  // Array of the parameter names
	callback     // The function to be executed after enter parameters
	             // It takes an array of entered values as argument
);

// Еще один вариант вызова
Module->inputPopup.open(
	paramNames,    // Array of the parameter names
	defaultValues  // Array of parameter default values
	callback       // The function to be executed after enter parameters
	               // It takes an array of entered values as argument
);
```
