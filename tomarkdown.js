#!/usr/bin/env node

var fs = require('fs'),
    dive = require('dive'),
    swig = require('swig'),
    pageBuilder = require('./pageBuilder.js'),
    pages = [],
    notFound = [];

dive('./node', { all: true }, function(err, file) {
  if (err) throw err;

  try {
  	var page = new pageBuilder.Page(file);
  	if (page.parts.id) {
  		pages.push(page);
  	}
  	else {
  		//page.log();
  	}
  }
  catch(E) {
     console.log(E);
	   notFound.push('No page for ' + file);
  }

}, function() {
    var template = swig.compileFile('./template.swig');
    pages.forEach(function(page) {
        fs.writeFile('./minimal/_posts/'+page.parts.slug+'.md', template(page.parts));
    });

});
