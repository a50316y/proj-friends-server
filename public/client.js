// var socket = io.connect();
var socket = io.connect("http://localhost:3000", {
    foceNew: true,
    transports: ["polling"],
});
socket.on('second', function (second) {
    $('#second').text(second.second);
});

$(document).ready(function () {
    $('#text').keypress(function (e) {
        socket.emit('client_data', String.fromCharCode(e.charCode));
    });
});