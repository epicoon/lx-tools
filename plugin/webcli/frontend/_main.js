/**
 * @const lx.Plugin Plugin
 * */

#lx:require -R classes/;

Console.init(Plugin->console);

^Respondent.getCommandList().then((list)=>new Cli(list));
