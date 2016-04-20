var toMd 		= require('to-markdown');
var cheerio 	= require('cheerio');
var fs 			= require('fs');
var slug        = require('slug');

var Page = function(file){
    this._$ = cheerio.load(fs.readFileSync(file), { ignoreWhitespace: true });
    var id = file.match(/node\/(\d+)\.html/);
    if (id) {
       this.parts = this.getParts();
       this.parts.id = id[1];
    }
    else {
        throw new Error('Not a node');
    }
};

Page.prototype.getParts = function() {
  var parts = {};
  parts.date = this.parseDate(this._$('.article .submitted .time').first().text());
  parts.title = this._$('#page-title').first().text();
  parts.slug = parts.date + '-' + slug(parts.title, {lower: true});
  parts.content = this.parseContent();
  parts.tags = this._$('.vocab ul li').text().split(' | ');
  parts.comments = this.parseComments();

  return parts;
}

Page.prototype.parseDate = function(datestring) {
    var date = datestring.match(/(\d+)\/(\d+)\/(\d+)/);
    // We return an ordered date for Jekyll
    return date ? [date[3],date[2],date[1]].join('-') : '' ;
};

Page.prototype.parseContent = function(){
	var raw = this._$('#content .article').clone();
		raw.find('ul.links').remove();
		raw.find('p.submitted').remove();
    raw.find('.vocab').remove();
    var self = this;
    raw.find('span, p, div').each(function() {
      if ( '' === self._$( this ).html().trim() ) {
        self._$( this ).remove();
      }
    });
		return raw.html() ? toMd(raw.html()) : '';
}

Page.prototype.parseComments = function(){
    var self = this;
    var comments = [];
    self._$('#comments .comment').each(function(i, elem) {
        comments[i] = {}
        comments[i].author = self._$(this).find('.author').first().text();
        comments[i].date = self.parseDate(self._$(this).find('.time').first().text()),
        self._$(this).find('.submitted').remove();
        self._$(this).find('.links').remove();
        comments[i].comment = self._$(this).text();

    });
        return comments;
}

Page.prototype.log = function(){
   	console.log(this.parts);
};

exports.Page = Page;
