var bot = require('alfred-teamspeak');
var cfg = require('./cfg.js');
var request = require('request');
var easypedia = require("easypedia");
var google = require('google');
var moment = require('moment');

require('moment-countdown');

var Chance = require('chance'),
    chance = new Chance();

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
	{ name: 'michalCWEL', body: '<15:25:36> "Zaq": Zgadzam sie tez!'},
	{ name: 'arijan', body: '[url=https://www.youtube.com/watch?v=vH4vdxTgefs]WYGIBASY[/url]'}
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

//apiCall('poland');
function apiCall(query, callback){
	query = query.join(' ').trim();
	console.log(query);
	var options = {language: "Pl", cache: true};
	easypedia(query, options, function(err, text){
		if(err){
			console.log('error');
			return callback('error', null);
		}
		
		console.log(text);
		return callback(null, text.sections[0].content[0].text);
	});

}

function googleSearch(query, callback){
	google.resultPerPage = 5;
	google.lang = 'pl';
	google.tld = 'pl';
	
	query = query.join(' ').trim();
	
	console.log(query);
	
	google(query, function(err, next, links){
		if(err){
			return callback('error', null);
		}
		return callback(null, links[0]);
	})
}

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
				// wiki command
				bot.addChannelCmd('wiki', channel, function(t){
						//console.log(t);
						//bot.sayChannel('t: '+t.info.params+' d: '+t.detail.msg, channel);
						apiCall(t.info.params, function(err, text){
							if(err){
								bot.sayChannel('[color=red]Jakiś ten... Fejk.[/color]', channel);
								return;
							}
								bot.sayChannel('[color=green]'+text+'[/color]', channel);							
						})
					});
				// google command
				bot.addChannelCmd('google', channel, function(t){
						// t.info.params
						googleSearch(t.info.params, function(err, adr){
							if(err || adr.link === null){
								bot.sayChannel('[color=red]Jakiś ten... Fejk.[/color]', channel);
								return;
							}
							//bot.sayChannel('[url='+adr.link+']'+adr.title+'[/url]', channel);
							bot.sayChannel('\n[url='+adr.link+']'+adr.title+'[/url]\n[color=green]'+ adr.description +'[/color]', channel);
						})
					});	
					
					// chance command
					bot.addChannelCmd('roll', channel, function(t){
						var num = chance.integer({min: -10, max: 100});
						//console.log(t);
						bot.sayChannel('[color=green][b]'+t.detail.client_nickname+'[/b][/color] [color=blue]wylosował [b]'+num+'.[/b][/color]', channel);
					});
					bot.addChannelCmd('kolor', channel, function(t){
						var color = chance.color({format: 'hex'});
						//console.log(t);
						bot.sayChannel('[color='+color+']Losowy kolor: '+color, channel);
					});
					bot.addChannelCmd('name', channel, function(){
						var name = chance.name();
						var country = chance.country({ full: true });
						bot.sayChannel('[color=green]Hi, my name is[/color] [color=blue][b]'+name+'.[/b][/color][color=green] I live in [/color][color=blue][b]'+country+'[/b][/color]');
					})
					
					bot.addChannelCmd('sunrise', channel, function(){
						var sunrise = moment("2016-07-19").countdown().toString();
						bot.sayChannel('[color=green]Nastepny SUNRISE za: [b]'+sunrise+'[/b][/color] [b][color=red]BIGOS, SZYKUJ DUPSKO![/color][/b]');
					});
					
					bot.addChannelCmd('czy', channel, function(t){
						if(!t.info.params.length){
							return;
						}
						var rnd = chance.integer({min: 0, max: 1});
						if(rnd===0){
							bot.sayChannel('[b][color=red]NIE[/color][/b]');
						}
						else{
							bot.sayChannel('[b][color=green]TAK[/color][/b]');							
						}
					});
				
				
				afterFirstRun = true;
			})
	})
}