var bot = require('alfred-teamspeak');
var cfg = require('./cfg.js');

var adminName = 'definitely not lajt';
var adminId = 2;
var intervalTime = 5000;
var afterFirstRun = false;
var botId;
var botCid;

bot.configure(cfg());

var commands = [
	{ name: 'kanapka', body: '[b]Kanapka[/b], malo [color=red]hp[/color]'},
	{ name: 'lekarz', body: '[color=blue]Tajemniczy [b]lekarz[/b] odbierajacy porod bigosa. Z jakiegos powodu bigos nie lubi o nim mowic...[/color]'},
	{ name: 'bigos', body: '\n[color=blue]I Like Cats They Meow:[/color] nah bro im too mad i got hacked\n[color=blue]I Like Cats They Meow:[/color] and i got 1 min more cooldown\n[b][color=green]kurtRolson(bigos):[/color] men i dont happy\n[color=green]kurtRolson(bigos):[/color] i too was hacker 3 month ago[/b][color=blue]'},
	{ name: 'michalCWEL', body: '<15:25:36> "Zaq": Zgadzam sie tez!'}
];

bot.on('login', function() {
    //bot.say('Kanapka, malo hp');
	bot.channelCommands = {};
	//findAdmin();
	setInterval(findAdmin, intervalTime);
	
});

bot.start();

bot.addConsoleCmd('say', function(params) {
    if(typeof params[0] === 'undefined') return;
    bot.say(params[0]);
}, 'say [text]', 'Write a given text in the global Chat');

bot.addGlobalCmd('bot', function(User) {
    bot.sayChannel('Kanapka, malo hp', 1);
}, false, 'bot', 'The bot will send you a private message');




function findAdmin(){
	//console.log('Find ADmin');
	bot.clientlist(function(data){
		data.filter(function(obj){
			if(obj.client_nickname === adminName){
				if(!afterFirstRun){
					updateCommands(null, obj.cid);
				}
				else if(obj.cid != botCid){
					bot.removeCommands();
					updateCommands(null, obj.cid);
				}
				return;
			}
		});
	})
}

function updateCommands(err, admin){
	console.log('Update Commands');
	if(err){
		console.log('err'+err);
	}
		console.log(admin);
		var channel = admin;
		bot.clientfind("Alfred", function(err,data){
		//console.log(data);
			bot.clientmove(data.clid, channel, function(err, dat){
				if(err){
					console.log(err);
				}
				botId = data.clid;
				botCid = channel;
				commands.filter(function(lajt){
					bot.addChannelCmd(lajt.name, channel, function(User){
						bot.sayChannel(lajt.body, channel);
					});
				})
				
				afterFirstRun = true;
			})
	})
}