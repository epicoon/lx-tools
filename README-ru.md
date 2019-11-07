[English version (Английская версия)](https://github.com/epicoon/lx-tools/blob/master/README.md)

## Сервис `lx-tools` для lx-платформы

Содержит виджеты и сниппеты, расширяющие базовый набор.

Включает:
* Плагины
    * [Плагин `codeRedactor`](#codeRedactor)
    * [Плагин `webcli`](#webcli)
* Виджеты
	* [LanguageSwitcher](#w-LanguageSwitcher)
* Сниппеты
	* [confirmPopup](#b-confirmPopup)
	* [inputPopup](#b-inputPopup)

<a name="codeRedactor"><h3>Плагин `codeRedactor`</h3></a>
Редактор кода, оформленный в виде плагина. Позволяет печатать код, подсвечивает синтаксис. Плагин при рендеринге может принимать два параметра:
* `lang` - язык кода. В настоящий момент поддерживаются `php` и `js`
* `text` - текст кода<br>
Пример:<br>
Создаем редактор в сниппете какого-то своего плагина:
```js
let $redactorBox = new lx.Box({key: 'redactorBox'});
redactorBox.setPlugin('lx/lx-tools:codeRedactor', {
	lang: 'php',
	text: '$test = 1;',
});
```
На стороне клиента в JS-коде плагина можем работать с редактором:
```js
let redactor = Plugin->redactorBox->>redactor;
// Получить код, который сейчас в редакторе
let code = redactor.getText();
// Установить другой код в редактор
redactor.setText(anotherCode);
// Поменять язык
redactor.lang = 'js';
```


<a name="webcli"><h3>Плагин `webcli`</h3></a>
Плагин, эмулирующий работу CLI в браузере.<br>
Можно добавить в проект роут, например такой:
```php
	'web-cli' => ['service-plugin' => 'lx/lx-tools:webcli', 'on-mode' => ['dev', 'test']],
```
Тогда по URL `your.domain/web-cli` сможем работать в командной строке платформы прямо из браузера.

<a name="w-LanguageSwitcher"><h3>Виджет `LanguageSwitcher`</h3></a>
Переключатель языка на основе `lx\Dropbox`, который хранит настройку языка в куках. Полное имя виджета с учетом пространства имен - `lx.tools.widget.LanguageSwitcher`.<br>
Использует в качестве перечня доступных языков список компонента приложения `language`.<br>
Пример использования:
```js
// Подключаем модуль с виджетом
#lx:use lx.tools.widget.LanguageSwitcher;

// Конфигурация стандартная для дропбокса
let widget = new lx.tools.widget.LanguageSwitcher(config);
```

<a name="b-confirmPopup"><h3>Сниппет `confirmPopup`</h3></a>
Сниппет, представляющий модальное окно, открывающееся с вопросом, требующим подтверждения.<br>
Пример использования:
```js
// В коде сниппета импортируем
Snippet.addSnippet({
	plugin: 'lx/lx-tools:snippets',
	snippet: 'confirmPopup'
});
```
```js
// Используем на стороне клиента в JS-коде плагина
Plugin->confirmPopup.open(
	question,  // Текст уточняющего вопроса
	callback   // Функция, которая будет выполнена в случае утвердительного выбора
);
```

<a name="b-inputPopup"><h3>Сниппет `inputPopup`</h3></a>
Сниппет, представляющий модальное окно, открывающееся с набором параметров, значения которых нужно ввести с клавиатуры.<br>
Пример использования:
```js
// В коде сниппета импортируем
Snippet.addSnippet({
	plugin: 'lx/lx-tools:snippets',
	snippet: 'inputPopup'
});
```
```js
// Используем на стороне клиента в JS-коде плагина
Plugin->inputPopup.open(
	paramNames,  // Массив наименований параметров, требующих ввода
	callback     // Функция, которая будет выполнена после ввода параметров
	             // В качестве аргумента принимает массив введенных значений
);

// Еще один вариант вызова
Plugin->inputPopup.open(
	paramNames,     // Массив наименований параметров, требующих ввода
	defaultValues,  // Массив значений по умолчанию для параметров
	callback        // Функция, которая будет выполнена после ввода параметров
	                // В качестве аргумента принимает массив введенных значений
);
```
