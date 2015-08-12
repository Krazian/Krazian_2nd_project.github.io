//Requirements
var express = require('express');
var fs = require('fs');
var request = require('request');
var sqlite3 = require('sqlite3');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var app = express();
var db = new sqlite3.Database('forum.db');

//Setup for parsing info, viewing pages, update and delete stuff, and making them look nice
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:false}));
app.set('view_engine','ejs');

//root path redirect
app.get("/",function(req,res){
	res.redirect("/threads");
});

//'home' page
app.get("/threads", function(req,res){
	//needs db.all
	res.render("index.ejs")
});


//'Server listening' and end of code
app.listen(3000,function(){
	console.log("Forum activated. Commence spamming and trolling.");
});