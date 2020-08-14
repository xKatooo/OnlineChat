"use strict"
const Captain = require('captainjs');
console = new Captain.Console({
    "use_colors": true,
    "debug": false,
    "format": "§8[§d%time%§8] [%prefix%§8] §7%message%",
    "log_prefix": "§aLog",
    "warn_prefix": "§eWarn",
    "error_prefix": "§cError",
    "info_prefix": "§bInfo",
    "debug_prefix": "§bDebug"
});

var express = require('express');

var app = express();

var http = require('http').Server(app);
var socketio = require('socket.io')(http);

var port = process.env.port || 3000;

app.use(express.static(__dirname + "/../Client"));
app.use(express.static(__dirname + "/../node_modules"));

var users = [];
socketio.on('connection', function(socket){
    console.log("§d Usuario Conectado!");
    socket.on('join', function(userName){
        console.log('Se ha conectado : ' + userName);

        socket.userName = userName;
        users.push(userName);
        //notice it is not socket.emit('refreshUserList', users)
        socketio.sockets.emit('refreshUserList', users);
    });

    socket.on('message', function(message){
        console.log(socket.userName + '§b :§r ' + message);

        var data = {
            userName: socket.userName,
            message: message
        };

        socketio.emit('message', data);
    });

    socket.on('disconnect', function(){

        //when user log off, the name should be removed from the user list
        var removedUserIndex = users.indexOf(socket.userName);
        if(removedUserIndex >= 0){
            users.splice(removedUserIndex, 1);
        }

        //notice it is not socket.emit('refreshUserList', users)
        socketio.sockets.emit('refreshUserList', users);

        console.log(socket.userName + ' se ha desconectado');
    });
});

http.listen(port, function(){
    console.log("Corriendo servidor en el puerto: " + port);
});
