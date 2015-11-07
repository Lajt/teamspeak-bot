
module.exports.link = function(link, name){
	var tempName = link;
	if(name != null){
		tempName = name;
	}
	return '[url='+link+']'+tempName+'[/url]';
}

module.exports.bold = function(text){
	return '[b]'+text+'[/b]';
}

module.exports.color = function(text, color){
	return '[color='+color+']'+text+'[/color]';
}

module.exports.special = function(text, col){
	return '[color=]'+col+'][b]'+text+'[/b][/color]';
}

module.exports.quote = function(author, text, col){
	return '[color='+col+'][b]'+author+': [/b]'+text+'[/color]';
}

module.exports.random = function(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}
