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
	db.all("SELECT title, id, created_at, comments FROM threads",function(err,row){
		if(err){
			throw err;
		}else{
			res.render("index.ejs",{threads:row})
		};
	});
});

//Filter page by comments
app.get("/threads/filter/comments", function(req,res){
		db.all("SELECT id, title, created_at, comments FROM threads ORDER BY comments DESC",function(err,comments){
			console.log(comments)
			res.render("filtered.ejs",{filter:comments});
		});
});

//Filter page by likes
app.get("/threads/filter/likes", function(req,res){
		db.all("SELECT * FROM threads ORDER BY likes DESC",function(err,likes){
			res.render("filtered.ejs",{filter:likes});
		});
});

//Edit a post
app.put("/threads/:id", function(req,res){
	var id = req.params.id;
	//if user deletes all text and submits, changes are not saved and is redirected to thread page
	if(req.body.content===""){
		res.redirect("/threads/"+id+"");
		//else the changes are saved
	}else{
	//changes content of post and the timestamp when it was changed
		db.run("UPDATE threads SET content=? WHERE id=?",req.body.content,id,function(err){
			console.log(req.body.content)
			console.log(id)
			if(err){
				throw err;
			};
			res.redirect("/threads/"+id+"");
		});
	};
});

//'specific thread' page
//3 nested db = no good, need to find a way to refactor
app.get("/threads/:id", function(req,res){
	var id = req.params.id;
	//grabs specific columns from specific thread where the id matches id in url
	db.get("SELECT threads.id, threads.title, users.username, threads.created_at, threads.updated_at, threads.content FROM threads INNER JOIN users ON threads.id=? WHERE users.id=threads.user_id;",id,function(err,threads){
				//within the thread grab certain columns from both tables to prevent overlapping
				db.all("SELECT users.username, users.id, comments.created_at, comments.content FROM comments INNER JOIN users ON comments.user_id=users.id WHERE comments.thread_id=?",id,function(err,users){
					//gets all users for dropdown in ejs
					db.all("SELECT * FROM users",function(err,allusers){
				res.render("show.ejs",{threads:threads, users:users, allusers:allusers});
				});
			});
		});
	});
	
//post a comment to thread then 'refresh' page
app.post("/threads/:id",function(req,res){
 var id = req.params.id;
 //prevents submitting empty comment
 if(req.body.content!==""){
	 db.run("INSERT INTO comments (thread_id,user_id,content) VALUES (?,?,?)",id,req.body.chooseUsername,req.body.content,function(err){
	 //Increments comments count for filter option
	 db.run("UPDATE threads SET comments=comments+1 WHERE id=?",id,function(err){});
		res.redirect("/threads/"+id+"");
	 });
}
});

//deleting thread and all comments on thread
app.delete("/threads/:id",function(req,res){
 var id = req.params.id;
 db.run("DELETE FROM threads WHERE id=?",id,function(err){});
 db.run("DELETE FROM comments WHERE thread_id=?",id,function(err){});
	res.redirect("/threads");
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

//'Server listening' and end of code
app.listen(3000,function(){
	console.log("Forum activated. Commence spamming and trolling.");
});

// INSERT INTO threads (user_id,title,content,likes,comments) VALUES (1,"Testing testing 123","This is just a test. I repeat, this is just a test.",0,0);