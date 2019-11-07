[Russian version (Русская версия)](https://github.com/epicoon/lx-tools/blob/master/README-ru.md)

## Service `lx-tools` for lx-platform

It contains plugins, widgets and snippets extending the basic set.

Contains:
* Plugins:
    * [Plugin `codeRedactor`](#codeRedactor)
    * [Plugin `webcli`](#webcli)
* Widgets
	* [LanguageSwitcher](#w-LanguageSwitcher)
* Snippets
	* [confirmPopup](#b-confirmPopup)
	* [inputPopup](#b-inputPopup)

<a name="codeRedactor"><h3>Plugin `codeRedactor`</h3></a>
Code editor, designed as a plugin. Allows you to print the code, highlights syntax. The plugin when rendering can take two parameters:
* `lang` - code language. Currently supported `php` and `js`
* `text` - code text<br>
Example:<br>
Create an editor in a view of some plugin:
```js
let redactorBox = new lx.Box({key: 'redactorBox'});
redactorBox.setPlugin('lx/lx-tools:codeRedactor', {
	lang: 'php',
	text: '$test = 1;',
});
```
We can work with the editor in a JS-code on the client side:
```js
let redactor = Plugin->redactorBox->>redactor;
// Get the code that is now in the editor
let code = redactor.getText();
// Set another code to the editor
redactor.setText(anotherCode);
// Change language
redactor.lang = 'js';
```


<a name="webcli"><h3>Plugin `webcli`</h3></a>
Plugin that emulates the work of the CLI in the browser.<br>
You can add a route to your project:
```php
	'web-cli' => ['service-plugin' => 'lx/lx-tools:webcli', 'on-mode' => ['dev', 'test']],
```
Then by the URL `your.domain/web-cli` you can work on the platform command line directly from the browser.

<a name="w-LanguageSwitcher"><h3>Widget `LanguageSwitcher`</h3></a>
This is a switcher of current language based on `lx\Dropbox`. It holds language setting in cookie. Full widget name with namespace is `lx.tools.widget.LanguageSwitcher`.<br>
As languages list it uses language array provided by application component `language`.<br>
Example:
```js
// Define switcher snippet code module
#lx:use lx.tools.widget.LanguageSwitcher;

// Configiration is standart for dropbox
let widget = new lx.tools.widget.LanguageSwitcher(config);
```

<a name="b-confirmPopup"><h3>Snippet `confirmPopup`</h3></a>
This snippet is a modal window. It may be opened with some question to comfirm.<br>
Example:
```js
// Import this snippet in a plugin snippet code
Snippet.addSnippet({
	plugin: 'lx/lx-tools:snippets',
	snippet: 'confirmPopup'
});
```
```js
// Use it on the client side
Plugin->confirmPopup.open(
	question,  // The text for the question to confirm
	callback   // The function to be executed in the case of confirm
);
```

<a name="b-inputPopup"><h3>Snippet `inputPopup`</h3></a>
This snippet is a modal window. It may be opened with the set of parameters to be entered by keyboard.<br>
Example:
```js
// Import this snippet in a plugin snippet code
Snippet.addSnippet({
	plugin: 'lx/lx-tools:snippets',
	snippet: 'inputPopup'
});
```
```js
// Use it on the client side
Plugin->inputPopup.open(
	paramNames,  // Array of the parameter names
	callback     // The function to be executed after enter parameters
	             // It takes an array of entered values as argument
);

// One more way to use it
Plugin->inputPopup.open(
	paramNames,    // Array of the parameter names
	defaultValues  // Array of parameter default values
	callback       // The function to be executed after enter parameters
	               // It takes an array of entered values as argument
);
```
