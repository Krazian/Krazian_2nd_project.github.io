//Requirements
var express = require('express');
var fs = require('fs');
var request = require('request');
var sqlite3 = require('sqlite3');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var app = express();
var db = new sqlite3.Database('forum.db');
var ejs = require('ejs');


//Setup for parsing info, viewing pages, update and delete stuff, and making them look nice
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:false}));
app.set('view_engine','ejs');

//Alert for bad info

//self explanatory
var api = JSON.parse(fs.readFileSync("api_keys.json","utf8"));

//root path redirect
app.get("/",function(req,res){
	res.redirect("/landing");
});

//intro sequence
app.get("/landing", function(req,res){
	res.render("landing.ejs")
})

//'home' page
app.get("/threads", function(req,res){
	db.all("SELECT title, id, created_at, updated_at, likes, comments FROM threads",function(err,row){
		if(err){
			throw err;
		}else{
			res.render("index.ejs",{threads:row})
		};
	});
});

//new user page
app.get("/threads/newuser", function(req,res){
	res.render("newuser.ejs");
});

//add random user
app.post("/threads/random/newuser",function(req,res){
	request("https://randomapi.com/api/?key="+api.random.key+"&id="+api.random.id, function(err,response,body){
		var name = JSON.parse(body).results[0].object.list;
		db.all("SELECT * FROM users",function(err,allusers){
			var match = false
			allusers.forEach(function(user){
				if (name === user.username){
					match = true;
				}});
				if (match === false){
					db.run("INSERT INTO users (username) VALUES (?)",name,function(err){});
					res.send("<h1><a href='/threads'>HOME</a></h1><script type='text/javascript'>alert('The name "+name+" was added! Hurrayyyy!! Now go home...What? You expected me to do that for you?')</script>");
				} else {
					res.send("<html lang='en'>"+
					"<head>"+
					"	<meta charset='UTF-8'>"+
					"	<title>Add New Username</title>"+
					"</head>"+
					"<body>"+
					"	<br/><button><a href='/threads'>Home</a></button><br/>"+
					"	<form method='POST' action='/threads/man/newuser'>"+
							"<input type='text' name='username'><br/><input type='submit'>"+
						"</form>"+
					"	<form method='POST' action='/threads/random/newuser'>"+
					"		<button>RANDOMIZE</button>"+
					"	</form>"+
					"</body>"+
					"<script type='text/javascript'>alert('This name already exists, come up with something original!')</script>"+
					"</html>");  
				};
			});
		});
	});

//add new user
app.post("/threads/man/newuser",function(req,res){
	db.all("SELECT * FROM users",function(err,allusers){
		var match = false
		allusers.forEach(function(user){
			if (req.body.username === user.username){
				match = true
			}});
			if (match === false){
				db.run("INSERT INTO users (username) VALUES (?)",req.body.username,function(err){});
				res.send("<h1><a href='/threads'>HOME</a></h1><script type='text/javascript'>alert('The name "+req.body.username+" was added! Hurrayyyy!! Now go home...What? You expected me to do that for you?')</script>");
			} else {
				res.send("<!DOCTYPE html>"+
					"<html lang='en'>"+
					"<head>"+
					"	<meta charset='UTF-8'>"+
					"	<title>Add New Username</title>"+
					"</head>"+
					"<body>"+
					"	<br/><button><a href='/threads'>Home</a></button><br/>"+
					"	<form method='POST' action='/threads/man/newuser'>"+
							"<input type='text' name='username'><br/><input type='submit'>"+
						"</form>"+
					"	<form method='POST' action='/threads/random/newuser'>"+
					"		<button>RANDOMIZE</button>"+
					"	</form>"+
					"</body>"+
					"<script type='text/javascript'>alert('This name already exists, come up with something original!')</script>"+
					"</html>");  
					};
				});
			});

//new thread page
app.get("/threads/newthread", function(req,res){
	db.all("SELECT * FROM users",function(err,allusers){
	res.render("new.ejs",{users:allusers});
})

//post a new thread
app.post("/threads",function(req,res){
	db.run("INSERT INTO threads (user_id,title,content,likes,comments) VALUES (?,?,?,?,?)",req.body.chooseUsername,req.body.title,req.body.content,0,0)
	res.redirect("/threads");
	});
});

//Filter page by comments
app.get("/threads/filter/comments", function(req,res){
		db.all("SELECT * FROM threads ORDER BY comments DESC",function(err,comments){
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
		db.run("UPDATE threads SET content=?, updated_at=(datetime('now','localtime')) WHERE id=?",req.body.content,id,function(err){

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
	};
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
				res.render("edit.ejs",{content:content});
			};
		});
});

//Like a thread
app.put("/threads/:id/likes", function(req,res){
	var id = req.params.id;
	db.run("UPDATE threads SET likes = likes+1 WHERE id=?", id, function(err){});
});

//'Server listening' and end of code
app.listen(3000,function(){
	console.log("Forum activated. Commence spamming and trolling.");
});