# Simple teamspeak bot

# Info

Simple teamspeak bot written in node.js  
Bot will follow certain user and respond to commands on user channel.  
It's required to have ServerQuery access.  
Bot is invisible so you don't see him on channel list.  

# Instalation

	git clone https://github.com/Lajt/teamspeak-bot.git
	cd teamspeak-bot
	npm install
	
Now rename 2 config files in settings folder:  

	**cfg.sample.js** to **cfg.js**
	**commands.sample.js** to **commands.js**
	
In cfg.js file:  

	module.exports.user = {
		'name': 'definitely not lajt', // User to follow
		'id': 2 // user id to follow - You don't need to set it manualy
	}

	module.exports.settings = {
		'name': 'Bot Geralt', // Bot name
		'host': 'localhost', // Server addres to connect
		'port': 10011, // ServerQuery port - 10011 is default
		'login-name': 'serveradmin', // ServerQuery login
		'login-pass': '1337leetpassword', // ServerQuery password
		'virtual-server': 1, // Virtual server to choose, 1 is default
		'command-identifier': '.' // What character user need to use before command expression
	};
	
# Configuration

Check commands.js file and edit them as you wish.

# Commands

Bot has few in-built commands for example:

	.roll // roll a random number.
	.name // send a random name.
	.wiki query // query wiki with first argument for example: .wiki github
	.google query // query google for example: .google Star Wars