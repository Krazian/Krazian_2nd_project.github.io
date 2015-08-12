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
	db.all("SELECT title, id, created_at FROM threads",function(err,row){
		if(err){
			throw err;
		}else{
			// console.log(row)
			res.render("index.ejs",{threads:row})
		};
	});
});

//'specific thread' page
app.get("/threads/:id", function(req,res){
	var id = req.params.id;
	//grabs specific thread from database
	db.get("SELECT * FROM threads INNER JOIN users ON threads.id="+id+" WHERE users.id=threads.user_id;",function(err,threads){
		if(err){
			throw err;
		}else{
			// console.log(threads)
				//grabs the usernames of the commenters of the specific thread
				db.all("SELECT * FROM comments INNER JOIN users ON comments.user_id=users.id WHERE comments.thread_id="+id+";",function(err,users){
					console.log(users)
				res.render("show.ejs",{threads:threads, users:users});
			});
		};
	});
});


//'Server listening' and end of code
app.listen(3000,function(){
	console.log("Forum activated. Commence spamming and trolling.");
});