var express = require("express");
var app = express();
app.use(express.static("./public"));
var server = require("http").Server(app);
const requestIp = require('request-ip');
var md5 = require('md5');
 

// start firebase 
var firebase = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://buoyant-imagery-815.firebaseio.com"
});
var db = firebase.database();
var ref = db.ref("chattool");

const usersRef = ref.child("messages");

const roomsRef = ref.child("rooms");
// end firebase
// get ip client
app.use(requestIp.mw())
 
var io = require("socket.io")(server);
server.listen(3000);
var listMessage = null;
// show danh sách room đang có.
io.on("connection",function(socket){
    // console.log(socket);
    socket.on("create-room-request", function(data) {
        let roomIp = data.myIp;
        let memberName = data.name;
        let timeNow = new Date().getTime();
        let roomName = md5(roomIp + memberName + timeNow);
        socket.join(roomName);
        socket.Phong = roomName;
        
        roomsRef.push({
            'owner_name' : data.masterName,
            'roomName' : roomName,
            'memberName' : memberName
        })
        //server gui room socket
        socket.emit("server-send-status-create-room", socket.Phong);
    })

    socket.on("load-message-for-room", function(data) {
        socket.join(data);
        listMessageusersRef.on("value", function(snap) {
            return snap;
        })
        if(listMessage.length > 0) {
            io.sockets.in(data).emit("load-all-message", listMessage);
        }
    })

    // user chat 
    socket.on("chat-message", function(data){
        var dataInsert = {
            'phong' : data.roomName,
            'msg' : data.msg,
            'created' : new Date().getTime()
        }
        usersRef.push(dataInsert);
        // chat insert to database
        io.sockets.in(data.roomName).emit("chat-message", data.msg);
    })
    
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", function(req, res){
    const yourIp = req.clientIp;
    var IP = yourIp.split(":");
    var sentIp = IP[IP.length - 1];
    res.render("trangchu", {yourIp : sentIp});
})