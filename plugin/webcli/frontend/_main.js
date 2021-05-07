/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:require -R classes/;

Console.init(Plugin->console);

^Respondent.getCommandList().then(res=>new Cli(res.data));
