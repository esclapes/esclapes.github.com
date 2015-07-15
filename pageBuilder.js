var toMd 		= require('to-markdown');
var cheerio 	= require('cheerio');
var fs 			= require('fs');
var slug        = require('slugg');

exports.Page = function(file){
    this._$ = cheerio.load(fs.readFileSync(file), { ignoreWhitespace: true });
    this.parts = {};
    var id = file.match(/node\/(\d+)\.html/);
    if (id) {
        this.parts.id = id[1];
        this.parts.date = this.parseDate(this._$('.article .submitted .time').first().text());
        this.parts.title = this._$('#page-title').first().text();
        this.parts.content = this.parseContent();
        this.parts.comments = this.parseComments();
    }
    else {
        throw new Error('Not a node');
    }
};

exports.Page.prototype.parseDate = function(datestring) {
    var date = datestring.match(/(\d+)\/(\d+)\/(\d+)/);
    // We return an ordered date for Jekyll
    return date ? [date[3],date[2],date[1]].join('-') : '' ;
};

exports.Page.prototype.parseContent = function(){
	var raw = this._$('#content .article').clone();
		raw.find('ul.links').remove();
		raw.find('p.submitted').remove();
		return raw.html() ? toMd(raw.html()) : '';
}

exports.Page.prototype.parseComments = function(){
    var self = this;
    var comments = [];
    self._$('#comments .comment').each(function(i, elem) {
        comments[i] = {}
        comments[i].author = self._$(this).find('.author a').first().text();
        comments[i].date = self.parseDate(self._$(this).find('.submitted time').first().text()),
        self._$(this).find('.submitted').remove();
        self._$(this).find('.links').remove();
        comments[i].comment = self._$(this).html() ? toMd(self._$(this).html()) : '';
        
    });
        return comments;
}

exports.Page.prototype.log = function(){
   	console.log(this.parts);
};
