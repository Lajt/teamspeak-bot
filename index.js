var bot = require('alfred-teamspeak');

var request = require('request');
var easypedia = require("easypedia");
var google = require('google');
var moment = require('moment');
var util = require('util');
var enc = require('./lib/lajt');

var cfg = require('./settings/cfg');
var cmd = require('./settings/commands');

require('moment-countdown');

var Stumpy = require('stumpy'),
	logger = Stumpy();

var Chance = require('chance'),
    chance = new Chance();

var adminName = cfg.user.name;
var adminId = cfg.user.id;
var intervalTime = 5000;
var afterFirstRun = false;
var botId;
var botCid;

var fatalErrors = [520, 3329];

bot.configure(cfg.settings);


var commands = cmd.commands;

bot.on('login', function() {
    //bot.say('Kanapka, malo hp');
	bot.registerEvent('server');
	bot.registerEvent('textserver');
	bot.registerEvent('textprivate');
	bot.registerEvent('textchannel');
	
	logger.info('BOT Login');
	bot.channelCommands = {};
	//findAdmin();
	setInterval(findAdmin, intervalTime);
	
});

bot.on('cliententerview', function(data) {
	bot.sayChannel(data["client_nickname"], botCid);
});

bot.on('clientmoved', function(data) {
	//{ ctid: '4', reasonid: '0', clid: '14' }
	if(data.ctid === botCid){
		logger.log('client move');
		bot.UserFind(data.clid, function(User){
			var name = User.detail.client_nickname;
			bot.sayChannel(cmd.welcome(name), botCid);
		})
	}
	
});

bot.on('heartbeat', function() {
	bot.log('[*] Sending Heartbeat');
});

bot.on('error', function(err) {
	if(fatalErrors.indexOf(err["err_code"]) != -1) throw new Error(util.inspect(err));
	console.error("An error occured:\n", util.inspect(err));
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
	logger.log('Wiki > looking for: '+query);
	var options = {language: "Pl", cache: true};
	easypedia(query, options, function(err, text){
		if(err){
			logger.error('Error in easypedia wiki api.');
			return callback('error', null);
		}
		
		//stumpy.log(text);
		return callback(null, text.sections[0].content[0].text);
	});

}

function googleSearch(query, callback){
	google.resultPerPage = 2;
	//google.lang = 'pl';
	//google.tld = 'pl';
	
	query = query.join(' ').trim();
	
	logger.log('Google > looking for: '+query);
	
	google(query, function(err, next, links){
		if(err){
			logger.error('Error in google api.')
			return callback('error', null);
		}
		if(links[0]===null){
			return callback(null, links[1]);
		}
		else{
			return callback(null, links[0]);
		}
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
					logger.warn('Trying to remove commands...');
					bot.removeCommands();
					updateCommands(null, obj.cid);
				}
				return;
			}
		});
	})
}

function updateCommands(err, admin){
	if(err){
		logger.error('Error in update commands function\n'+err);
	}
		logger.info('Switching channel to: '+admin);
		var channel = admin;
		bot.clientfind(cfg.settings.name, function(err,data){
		//console.log(data);
			bot.clientmove(data.clid, channel, function(err, dat){
				if(err){
					logger.error('Error: cannot move client. \n'+err);
				}
				botId = data.clid;
				botCid = channel;
				bot.registerEvent('channel', {id: channel});
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
								logger.warn('Cant find requested wiki query.');
								bot.sayChannel('[color=red]A tu ten... Fejk.[/color]', channel);
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
								logger.warn('Cant find requested wiki query.');
								bot.sayChannel('[color=red]A tu ten... Fejk.[/color]', channel);
								return;
							}
							//bot.sayChannel('[url='+adr.link+']'+adr.title+'[/url]', channel);
							bot.sayChannel('\n[url='+adr.link+']'+adr.title+'[/url]\n[color=green]'+ adr.description +'[/color]', channel);
						})
					});	
					
					// chance command
					/*bot.addChannelCmd('test', channel, function(t){
						bot.sayChannel(t.info.params[0], channel);
						bot.sayChannel(typeof(t.info.params[0]), channel);
					});*/
										
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
						convertDate(sunrise, function(err, date){
							bot.sayChannel('[color=green]Nastepny SUNRISE za: [b]'+date+'[/b][/color] [b][color=red]BIGOS, SZYKUJ DUPSKO![/color][/b]');
					
						});
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



function convertDate(data, callback){
	var date = data;
	logger.log(date);
	try{
		date = date.replace("months", "miesiecy");	
		date = date.replace("days", "dni");
		date = date.replace("hours", "godzin");
		date = date.replace("minutes", "minut");
		date = date.replace("seconds", "sekund");
		date = date.replace("and", "i");
		callback(null, date);
	}
	catch(err){
		return callback(err, null);
	}
	
	
}

// DEBUG OUTPUT
setInterval(function(){
	logger.info('Interval function started');
	bot.clientlist(function(data){
	logger.group();
		data.map(function(obj){
			logger.warn(obj.client_database_id+'\t'+obj.client_nickname);
		})
	logger.groupEnd();
	})
	bot.sendCommand('clientfind', 'pattern=Mikhail Zaqov', function(err, res, raw) {
		if(err){
			logger.error(err);
		}
		logger.log(res);
	});

}, 360000)