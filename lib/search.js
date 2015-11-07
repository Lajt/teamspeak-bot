var google = require('google');
var easypedia = require('easypedia');

module.exports.googleSearch = function(query, cb){
	query = query.join(" ").trim();	
	console.log('Google > search: '+query);
	
	google.resultPerPage = 2;
	
	google(query, function(err, next, links){
		if(err){
			console.log('Google > error: '+err);
			return cb('error', null);
		}
		return cb(null, links[0] || links[1] || links[2]);
	});
	
};

module.exports.wikiSearch = function(query, cb){
	query = query.join(" ").trim();
	console.log('Wiki > search: '+query);
	
	var options = {language: "Pl", cache: true};
	easypedia(query, options, function(err, data){
		if(err){
			console.log('Wiki > error: '+err);
			return cb('error', null);
		}
		return cb(null, data.sections[0].content[0].text);
	});
};