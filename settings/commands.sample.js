var enc = require('../lib/lajt');

module.exports.welcome = function(name){
	return '[color=red][b]'+name+'[/b], Welcome![/color]';
}

module.exports.commands = [
	{
		name: 'ping',	// name of command
		body: 'pong'	// normal bot text answer
	},
	{
		name: 'site', 
		body: enc.link('http://google.com') // link answer
	},
	{
		name: 'quote',
		body: enc.quote('Uszat', 'Your team are have tomorrow big?', 'green') // arguments: author, text, color
	},
	{
		name: 'hp',
		body: '[b]Careful[/b], [color=red]low hp[/color]' // you can put bbcode in answer
	},
	{
		name: 'bold',
		body: enc.bold('bold answer')	
	},
	{
		name: 'witcher',
		body: enc.special('ZARAZA!', 'red') // bold and colored answer
	}
];