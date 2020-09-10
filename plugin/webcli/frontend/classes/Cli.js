class Cli {
	constructor(list) {
		this.commandList = list;

		this.service = null;
		this.plugin = null;

		this.inputString = '';
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

		var command = this.identifyCommandKey(input);
		this.inputString = input;

		if (command == '\\h' || command == 'help') {
			this.showCommands();
			Console.input(this.getLocationText());
			return;
		}

		if (command == 'clear') {
			this.clearConsole();
			Console.input(this.getLocationText());
			return;
		}

		if (!this.validateCommand(command)) {
			Console.outln("Unknown command '" + command +"'. Enter 'help' to see commands list");
			Console.outCache();
			Console.input(this.getLocationText());
			return;
		}

		this.handleCommand(command);
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
		^Respondent.handleCommand(command, this.inputString, this.processParams, this.service, this.plugin).then((result)=>{
			if (!result.success) {
				Console.outln(result.data);
				Console.outCache();
				Console.input(this.getLocationText());
				return;
			}

			result = result.data;

			if (result.data && result.data.code == 'ext') {
				this.handleExtendedCommand(result.data);
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
			ab->body.setPlugin(data.plugin);
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
		var arr = [];
		this.commandList.each(item=>{
			arr.push([
				item.description,
				item.command.isArray ? item.command.join(', ') : item.command
			]);
		});

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

	identifyCommandKey(input) {
		var arr = input.split(' ');
		var command = arr.shift();
		return command;
	}

	validateCommand(commandName) {
		for (var i=0, l=this.commandList.len; i<l; i++)
			if (this.commandList[i].command.contains(commandName))
				return true;
		return false;
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
		for (let key in commands) {
			let command = commands[key].command;
			if (!command.isArray) command = [command];

			for (let i in command) {
				let commandName = command[i];
				if (commandName != text) {
					var reg = new RegExp('^' + text);
					if (commandName.match(reg)) {
						matches.push(commandName);
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
