const chatModel = require('../db/model/chat');
var arrAllSocket = [];

// 暴露的是一個函數 , 需要導入 server
module.exports = function (server) {
    // 得到io對象
    const io = require('socket.io')(server,{
        foceNew: true,
        transports: ['websocket', 'xhr-polling', 'polling', 'jsonp-polling', 'htmlfile', 'flashsocket'],
        origins: ["http://localhost:8080"],
  
    }).listen(server);


    io.on('connection', function (socket) { // 監視連接 , 當有客戶端連上時觸發
        console.log('soketio connected')

        socket.on('join', function (userId) { //打開聊天室
            user = userId;
            arrAllSocket[user] = socket;//把socket存到全域性數組裡面去
            console.log(userId + ' join message!!!')
        });
        socket.on('leave', function (userId) { //關閉聊天室
            user = userId;
            delete arrAllSocket[user];//把使用者從全域性數組裡面刪去
            console.log(userId + ' leave the message!!!')
        });        

        socket.on('private_message', function (from, to, msg) { 
            // console.log('接收客戶端的訊息', { from, to, msg })
            var target = arrAllSocket[to];
            var userRe = arrAllSocket[from];
            // 處理訊息 存入資料庫
            let fromId = from
            let ToId = to
            new chatModel({ fromId, ToId, msg }).save((err, chat) => {
                if (err) {
                    console.log(err)
                } else {
                    if (target) {
                        // console.log('傳給對方')
                        target.emit("pmsg", chat);
                    }
                    if (userRe) {
                        userRe.emit("pmsg", chat); //回傳給使用者自己 代表訊息有傳成功
                        // console.log('傳給自己')
                    }
                }
            })

        }); 

        socket.on('read', function (from, to) { //訊息已讀(讀對方的訊息)
            let fromId = from
            let ToId = to
            var target = arrAllSocket[from];            
            chatModel.updateMany({ fromId, ToId, read: false }, { $set: { read: true } }, (err, oldChats) => {
                // 返回更新的數量 讓前端可以計算總共的未讀數量 oldChats.nModified)
                console.dir(oldChats)
                if (err) {
                    console.log(err)
                } else {
                    if (target) { //已讀要讓對方知道
                        console.log('已讀傳給對方')
                        target.emit("oppRead", oldChats);
                    }
                }                
            })                               
        });           


        //try local
        setInterval(function () {
            socket.emit('second', { 'second': new Date().getSeconds() });
        }, 1000);
        
        socket.on('client_data', function (data) {
            console.log(data);
        });



    })
}