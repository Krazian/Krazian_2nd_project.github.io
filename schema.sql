DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
id INTEGER PRIMARY KEY,
username TEXT
);

CREATE TABLE threads(
id INTEGER PRIMARY KEY,
user_id INTEGER,
title TEXT,
content TEXT,
likes INTEGER,
comments INTEGER,
created_at TIMESTAMP DEFAULT (datetime('now','localtime')),
updated_at TIMESTAMP DEFAULT (datetime('now','localtime')),
FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments(
id INTEGER PRIMARY KEY,
thread_id INTEGER,
user_id INTEGER,
content TEXT,
created_at TIMESTAMP DEFAULT (datetime('now','localtime')),
updated_at TIMESTAMP DEFAULT (datetime('now','localtime')),
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (thread_id) REFERENCES threads(id)
);

CREATE TABLE likes(
id INTEGER PRIMARY KEY,
thread_id INTEGER,
user_id INTEGER,
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (thread_id) REFERENCES threads(id)
);

PRAGMA foreign_keys = ON;