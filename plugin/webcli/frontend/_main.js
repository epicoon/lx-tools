/**
 * @const lx.Plugin Plugin
 * */

#lx:require -R classes/;

Console.init(Plugin->console);

^Respondent.getCommandList():(list)=>new Cli(list);
