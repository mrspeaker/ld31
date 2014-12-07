"use strict";

var express = require("express"),
	app = express(),
	http = require("http").Server(app),
	io = require("socket.io")(http),
	port = 3001;

app.get("/", function(req, res){
	res.sendFile("index.html", {"root": "../"});
});

app.use("/src", express.static(__dirname + "/../src/"));
app.use("/res", express.static(__dirname + "/../res/"));
app.use("/css", express.static(__dirname + "/../css/"));

io.on("connection", function (client) {

	console.log("connecty");
	client.emit("onconnected", "lol");

});

http.listen(port, function () {

	console.log("listening on *:" + port);

});
