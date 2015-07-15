#!/usr/bin/env node

var dive = require('dive'),
    pageBuilder = require('./pageBuilder.js'),
    notFound = [];
 
dive('./node', { all: true }, function(err, file) {
  if (err) throw err;
  
  try {
  	var page = new pageBuilder.Page(file);
  	if (page.parts.id == '99') {
  		page.log();
  	}
  	else {
  		//page.log();
  	}
  }
  catch(E) {
  	//console.log(E);
	notFound.push('No page for ' + file);
  }
  
}, function() {
  console.log(notFound);
});