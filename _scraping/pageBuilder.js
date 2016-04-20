var toMd 		= require('to-markdown'),
    cheerio = require('cheerio'),
    slug    = require('slug'),
    fs      = require("fs"),
    url     = require("url"),
    path    = require("path"),
    http    = require("http"),
    util    = require('util');

var Page = function(file){
    this._$ = cheerio.load(fs.readFileSync(file), { ignoreWhitespace: true });
    var id = file.match(/node\/(\d+)\.html/);
    if (id) {
      this.parts = {};
      this.parts.id = id[1];
      this.parts.date = this.parseDate();
      this.parts.title = this._$('#page-title').first().text();
      this.parts.slug = this.parts.date + '-' + slug(this.parts.title, {lower: true});
      this.parts.content = this.parseContent();
      this.parts.tags = this._$('.vocab ul li').text().split(' | ');
      this.parts.comments = this.parseComments();
    }
    else {
        throw new Error('Not a node: ' + file);
    }
};

Page.prototype.parseDate = function() {
    var datestring = this._$('.article .submitted .time').first().text();
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
    // remove empty divs and other wysiwyg side effects
    raw.find('span, p, div').each(function() {
      if ( '' === self._$( this ).html().trim() ) {
        self._$( this ).remove();
      }
    });
    // copy local images
    raw.find('img').each(function() {
      var img = self._$( this );
      newSrc = self.copyImage(img.attr('src'));
      img.attr('src', newSrc);

      if(img.parent().is('a')) {
        self._$( this ).parent().replaceWith(img);
      }
      else {
        self._$( this ).replaceWith(img);
      }
      //console.log(util.inspect(self._$( this ), { depth: null }));
    });
		return raw.html() ? toMd(raw.html()) : '';
}

Page.prototype.copyImage = function(src) {
  var parsed = url.parse(src);
  var filename = path.basename(parsed.pathname);
  var directory = "../images/posts/" + this.parts.slug;

  downloadIfNotExists(directory, filename, src);

  return (directory + "/" + filename).slice(2);
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

var downloadIfNotExists = function(directory, filename, src) {
  var dest = directory + "/" + filename;
  // check if file is already downloaded
  fs.access(dest, (err) => {
    if (!err) {
      console.log("File " + filename + " already exists in " + directory);
    }
    else {
      checkDirectorySync(directory);
      download(src, dest, (err) => {
        if(err) console.log("Error on download: " + err.message);
      })
    };
  });


}

var checkDirectorySync = function(directory) {
  try {
    fs.statSync(directory);
  } catch(e) {
    fs.mkdirSync(directory);
  }
}

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    cb(err);
  });
};

exports.Page = Page;
