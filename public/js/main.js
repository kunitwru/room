var socket = io("http://192.168.1.74:3000");
var loadFlg = 1;

// hien thi ten phong dang join
socket.on("server-send-status-create-room", function(data){
    if(data) {
        localStorage.setItem("roomName", data);
        $("#firstChat").hide();
        $("#secordChat").show(2000);
        $("#roomID").val(data);
    }
    
})

// lang nghe su kien server chat
socket.on("chat-message", function(data){
    $("ul#msgList").append("<li class='msg'>"+data+"</li>")
})

function loadMessage() {
    if(loadFlg === 1) {
        var roomName = localStorage.getItem("roomName");
        if(roomName) {
            socket.emit("load-message-for-room", roomName);
            $("#firstChat").hide();
            $("#secordChat").show();
            $("#roomID").val(roomName);
            $("ul#msgList").html("");
            socket.on("load-all-message", function(data) {
                Object.values(data).forEach(function(value) {
                    $("ul#msgList").append("<li>" + value.msg + "</li>")
                });
            })
        }
        loadFlg = 0;
    }
}

// kiểm tra kết qủa đăng ký thành viên fail từ server trả về

$(document).ready(function() {
    $("#startChat").click(function(){
        socket.emit("create-room-request", {name : $("#fullname").val(), myIp : $("#yourIp").val(), masterName : $("#masterName").val()});
    });
    $( "#formsendmsg" ).submit(function( event ) {
        event.preventDefault();
        if($("#txtMessage").val()) {
            socket.emit("chat-message", {msg : $("#txtMessage").val(), roomName : $("#roomID").val()});
            $("#txtMessage").val("");
        }
    });
    // load message
    loadMessage();
    // chat
    $("#btnSend").click(function() {
        socket.emit("chat-message", {msg : $("#txtMessage").val(), roomName : $("#roomID").val()});
        $("#txtMessage").val("");
    })
})
