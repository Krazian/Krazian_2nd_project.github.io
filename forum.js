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
			res.render("index.ejs",{threads:row})
		};
	});
});

//Edit page
app.get("/threads/:id/edit",function(req,res){
	var id = req.params.id;
	db.get("SELECT threads.id, threads.title, users.username, threads.created_at, threads.updated_at, threads.content FROM threads INNER JOIN users ON threads.id=? WHERE users.id=threads.user_id;",id,function(err,content){
		if(err){
			throw err;
		}else{
			res.render("edit.ejs",{content:content})
		};
	});
});

//Edit a post
app.put("/threads/:id", function(req,res){
	var id = req.params.id;
	//changes content of post and the timestamp when it was changed
	db.run("UPDATE threads SET content=? WHERE id=?",req.body.content,id,function(err){
		console.log(req.body.content)
		console.log(id)
		if(err){ //something happens here
			throw err;
		};
		res.redirect("/threads/"+id+"");
	});
});

//'specific thread' page
app.get("/threads/:id", function(req,res){
	var id = req.params.id;
	//grabs specific columns from specific thread where the id matches id in url
	db.get("SELECT threads.id, threads.title, users.username, threads.created_at, threads.updated_at, threads.content FROM threads INNER JOIN users ON threads.id=? WHERE users.id=threads.user_id;",id,function(err,threads){
		if(err){
			throw err;
		}else{
				//within the thread grab certain columns from both tables to prevent overlapping
				db.all("SELECT users.username, users.id, comments.created_at, comments.content FROM comments INNER JOIN users ON comments.user_id=users.id WHERE comments.thread_id=?",id,function(err,users){
					// console.log(users)
				res.render("show.ejs",{threads:threads, users:users});
			});
		};
	});
});

//post a comment to thread then 'refresh' page
app.post("/threads/:id",function(req,res){
 var id = req.params.id;
 db.run("INSERT INTO comments (thread_id,user_id,content) VALUES (?,?,?)",id,1,req.body.content,function(err){
 	if(err){
 		throw err;
 	};
 	res.redirect("/threads/"+id+"");
 });
});


//'Server listening' and end of code
app.listen(3000,function(){
	console.log("Forum activated. Commence spamming and trolling.");
});