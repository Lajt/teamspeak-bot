var bot = require('alfred-teamspeak');

var request = require('request');
var moment = require('moment');
var util = require('util');

var enc = require('./lib/lajt');
var search = require('./lib/search');

var Watcher = require('rss-watcher');

var cfg = require('./settings/cfg');
var cmd = require('./settings/commands');

var watcher = new Watcher(cfg.user.feed);

require('moment-countdown');

var Stumpy = require('stumpy'),
	logger = Stumpy();

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
	bot.registerEvent('server');
	bot.registerEvent('textserver');
	bot.registerEvent('textprivate');
	bot.registerEvent('textchannel');
	
	logger.info('BOT Login');
	bot.channelCommands = {};
	setInterval(findAdmin, intervalTime);
	
});

watcher.on('new article', function(article){
	logger.info(article.title+'\n'+article.link);
	bot.sayChannel('\n[color=green]'+article.title+'[/color]\n[url='+article.link+']'+article.link+'[/url]', botCid);
});

watcher.run(function(err, articles){
	if(err) throw err;
	console.log(articles);
})


bot.on('cliententerview', function(data) {
	logger.info(data["client_nickname"]);
	//bot.sayChannel(data["client_nickname"], botCid);
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
	logger.error('ERROR, ERROR, ERROR');
	if(fatalErrors.indexOf(err["err_code"]) != -1) throw new Error(util.inspect(err));
	console.error("An error occured:\n", util.inspect(err));
});

bot.start();

function findAdmin(){
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
						//bot.sayChannel('t: '+t.info.params+' d: '+t.detail.msg, channel);
						search.wikiSearch(t.info.params, function(err, text){
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
						search.googleSearch(t.info.params, function(err, adr){
							if(err || adr.link === null){
								logger.warn('Cant find requested wiki query.');
								bot.sayChannel('[color=red]A tu ten... Fejk.[/color]', channel);
								return;
							}
							bot.sayChannel('\n[url='+adr.link+']'+adr.title+'[/url]\n[color=green]'+ adr.description +'[/color]', channel);
						})
					});	
										
					bot.addChannelCmd('roll', channel, function(t){
						var num = enc.random(1, 100);
						bot.sayChannel('[color=green][b]'+t.detail.client_nickname+'[/b][/color] [color=blue]wylosował [b]'+num+'.[/b][/color]', channel);
					});
					
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
						var rnd = enc.random(0,1);
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
