class Cli {
	constructor(list) {
		this.commandList = list;

		this.service = null;
		this.plugin = null;

		this.args = [];
		this.commandsHistory = [];
		this.commandsHistoryIndex = 0;

		this.processParams = [];
		this.inProcess = false;
		this.processNeed = null;

		Console.useCache = true;
		Console.input(this.getLocationText());
		Console.setCallback('Enter', [this, this.onEnter]);
		Console.setCallback('Tab', [this, this.onTab]);
		Console.setCallback('ArrowUp', [this, this.onUp]);
		Console.setCallback('ArrowDown', [this, this.onDown]);
	}

	/**
	 *
	 * */
	getLocationText() {
		var text;
		if (this.plugin) {
			text = 'lx-cli&lt;plugin:' + this.service + ':' + this.plugin + '&gt;:';
		} else if (this.service) {
			text = 'lx-cli&lt;service:' + this.service + '&gt;:';
		} else {
			text = 'lx-cli&lt;app&gt;:';
		}
		return text;
	}

	/**
	 *
	 * */
	onEnter() {
		if (this.inProcess) {
			this.processParams[this.processNeed] = Console.command;
			this.handleCommand(this.inProcess);
			return;
		}

		var input = Console.command;
		if (input == '') {
			Console.input(this.getLocationText());
			return;
		}

		if (!this.commandsHistory.len || input != this.commandsHistory.last()) {
			this.commandsHistory.push(input);
			this.commandsHistoryIndex = this.commandsHistory.len;
		}
		var inputData = this.parseInput(input),
			command = inputData[0];
		this.args = inputData[1];

		if (this.checkCommand(command, 'help')) {
			this.showCommands();
			Console.input(this.getLocationText());
			return;
		}

		if (this.checkCommand(command, 'clear_console')) {
			this.clearConsole();
			Console.input(this.getLocationText());
			return;
		}

		var commandType = this.identifyCommandType(command);
		if (commandType === false) {
			Console.outln("Unknown command '" + command +"'. Enter 'help' to see commands list");
			Console.outCache();
			Console.input(this.getLocationText());
			return;
		}

		this.handleCommand(commandType);
	}

	/**
	 *
	 * */
	onTab() {
		var currentInput = Console.getCurrentInput();
		var command = this.tryFinishCommand(currentInput);
		if (command) {
			if (command.common == currentInput) {
				Console.outln();
				Console.outln(command.matches.join('  '));
				Console.outCache();
				Console.input(this.getLocationText());
				Console.replaceInput(currentInput);
			} else {
				Console.replaceInput(command.common);
			}
		}
	}

	/**
	 *
	 * */
	onUp() {
		if (this.commandsHistoryIndex == 0) return;
		this.commandsHistoryIndex--;
		Console.replaceInput(this.commandsHistory[this.commandsHistoryIndex]);
	}

	/**
	 *
	 * */
	onDown() {
		if (this.commandsHistoryIndex == this.commandsHistory.len) {
			return;
		}
		this.commandsHistoryIndex++;
		if (this.commandsHistoryIndex == this.commandsHistory.len) {
			Console.replaceInput('');
			return;
		}
		Console.replaceInput(this.commandsHistory[this.commandsHistoryIndex]);
	}


	/**************************************************************************************************************************
	 * Обработка команд
	 *************************************************************************************************************************/

	/**
	 *
	 * */
	handleCommand(command) {
		^Respondent.handleCommand(command, this.args, this.processParams, this.service, this.plugin).then((result)=>{
			if (!result.success) {
				Console.outln(result.data);
				Console.outCache();
				Console.input(this.getLocationText());
				return;
			}

			result = result.data;

			if (result.extensionData) {
				this.handleExtendedCommand(result.extensionData);
				return;
			}

			for (var key in result.params) {
				var value = result.params[key];
				this.processParams[key] = value;
			}
			for (var i in result.invalidParams) {
				var name = result.invalidParams[i];
				delete this.processParams[name];
			}
			for (var i in result.output) {
				var row = result.output[i];
				var decor = '';
				if (row[2] && row[2].decor) decor = row[2].decor;
				if (row[0] == 'in') {
					Console.outCache();
					this.processNeed = result.need;
					this.inProcess = command;
					Console.input(row[1], decor);
					return;
				}
				Console[row[0]](row[1], decor);
			}
			Console.outCache();

			if (result.keepProcess) {
				this.inProcess = command;
			} else {
				this.inProcess = false;
				this.processNeed = null;
				this.processParams = [];
				this.service = result.service;
				this.plugin = result.plugin;
				Console.input(this.getLocationText());
			}
		});
	}

	/**
	 * @param data
	 */
	handleExtendedCommand(data) {
		if (data.message) {
			Console.outln(data.message);
			Console.outCache();
		}
		Console.input(this.getLocationText());
		Console.checkCarret();

		if (data.type == 'plugin') {
			var ab = new lx.ActiveBox({
				parent: lx.body,
				geom: true,
				header: data.header,
				closeButton: {click:()=>ab.del()}
			});
			ab->body.injectPlugin(data.plugin);
		}
	}

	/**
	 *
	 * */
	clearConsole() {
		Console.clear();
	}

	/**
	 * 
	 * */
	showCommands() {
		var commands = this.commandList;
		var arr = [];
		for (var key in commands) {
			var str = key.ucFirst();
			str = str.replace(/_/g, ' ');
			var commandsStr = commands[key].isArray ? commands[key].join(', ') : commands[key];
			arr.push([str, commandsStr]);
		}

		arr = Console.normalizeTable(arr, '.');
		for (var i in arr) {
			var row = arr[i];
			Console.out(row[0] + ': ', 'b');
			Console.outln(row[1]);
		}
		Console.outCache();
	}


	/**************************************************************************************************************************
	 * Методы, обслуживающие базовую работу командной строки
	 *************************************************************************************************************************/

	/**
	 * Получить агрумент по ключу (или индексу, если массив аргументов перечислимый)
	 * */
	getArg(key) {
		if (key.isArray) {
			for (var i in key) {
				var item = key[i];
				if (this.args[item] !== undefined) {
					return this.args[item];
				}
			}
			return null;
		}

		if (this.args[key] !== undefined) {
			return this.args[key];
		}
		return null;
	}

	/**
	 * Вычленяет из введенного текста имя команды и аргументы:
	 * Или так:
	 * lx-cli<app>: command arg1 arg2 "arg3 by several words"
	 * Или так:
	 * lx-cli<app>: command -k=arg1 --key="arg2 by several words"
	 * Но не перечислением и ключами одновременно (в этом случае ключи учтутся, перечисленные будут проигнорированы)
	 * @param $input string - строка консольного ввода
	 * */
	parseInput(input) {
		var matches = input.match(/".*?"/g);
		var line = input.replace(/".*?"/g, '№№№'); // preg_replace('/".*?"/', '№№№', $input);
		var arr = line.split(' ');

		if (matches && matches.len) {
			var counter = 0;
			arr.each((value, i)=>{
				if (!value.match(/№№№/)) return;
				arr[i] = value.replace(/№№№/, matches[counter++]);
			});
		}

		var command = arr.shift(),
			counted = [],
			assoc = [];

		arr.each((item)=>{
			if (item[0] != '-') {
				counted.push(item);
				return;
			}
			var temp = item.split('=');
			//todo - если в значении текст, а в тексте символ равно?
			var key = temp[0].match(/^-+?([^-].*)$/)[1];
			var value = temp[1].match(/^"*?([^"]?.*[^"]?)"*$/)[1];
			assoc[key] = value;
		});

		var args = assoc.lxEmpty ? counted : assoc;
		return [command, args];
	}

	/**
	 *
	 * */
	identifyCommandType(command) {
		var keywords = this.commandList;
		for (var key in keywords) {
			var value = keywords[key];
			if (!value.isArray) value = [value];
			for (var i in value) {
				var commandName = value[i];
				if (command == commandName) {
					return key;
				}
			}
		}
		return false;
	}

	/**
	 * Проверяет соответствует ли команда какой-то категории
	 * @param command string - команда, уже вычлененная из строки консольного ввода
	 * */
	checkCommand(command, key) {
		var keywords = this.commandList[key];
		if (keywords.isArray) return (keywords.contains(command));
		return command == keywords;
	}

	/**
	 * Пытается дополнить введенную команду:
	 * - находит ближайшее общее если подходящих команд несколько
	 * - помимо общего возвращает список подходящих команд
	 * @param text string - строка, которую требуется дополнить
	 * */
	tryFinishCommand(text) {
		if (text[0] == String.fromCharCode(92)) {
			return false;
		}

		var len = text.length;
		if (len == 0) {
			return false;
		}

		var matches = [];

		var commands = this.commandList;
		for (var key in commands) {
			var keywords = commands[key];
			if (!keywords.isArray) keywords = [keywords];
			for (var i in keywords) {
				var command = keywords[i];
				if (command != text) {
					var reg = new RegExp('^' + text);
					if (command.match(reg)) {
						matches.push(command);
					}
				}
			}
		}

		if (!matches.len) {
			return false;
		}

		var common = text;
		var i = len;
		while (true) {
			var latterMatch = true;
			if (i >= matches[0].length) break;
			var latter = matches[0][i];
			var stop = false;
			for (var key in matches) {
				var command = matches[key];
				if (i >= command.len) { stop = true; break; }
				if (latter != command[i]) { stop = true; break; }
			}
			if (stop) break;
			common += latter;
			i++;
		}

		return {common, matches}
	}
}
