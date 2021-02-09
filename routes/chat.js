var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5');
const jwt = require('jsonwebtoken');
const member = require('../db/model/member');
const apply = require('../db/model/apply');
const chat = require('../db/model/chat');
const apiRes = require('./../db/apiResponse');
const VerifyJWT = require('./../middleware/VerifyJWT');
const multer = require('multer');
const base64Img = require('base64-img');

const proj = { password: 0, __v: 0, base: 0, _id: 0 } //過濾欄位
const proj1 = { password: 0, __v: 0, base: 0 } //過濾欄位
const proj2 = { _id: 0, __v: 0 } //過濾欄位


// 返回MsgList資訊
router.post('/getMsg', VerifyJWT(), function (req, res) {
    const fromId = req.body.from
    const ToId = req.body.to
    chat.find({ $or: [{ fromId: fromId, ToId: ToId }, { fromId: ToId, ToId: fromId }] }, proj2, async (err, AllMsg) => {
       // 找出所有跟對方的訊息(傳給對方 對方傳給我)
        if (err) {
            console.log(err)
        }
        if (AllMsg) { // 對方對你申請(喜歡或不喜歡)
            // console.log(AllMsg)
            res.send(new apiRes.SuccessResponse(AllMsg.reverse()))
        }
        else {
            res.send(new apiRes.FailResponse('沒有資料'))
        }
    })
});

/* 將訊息改為已讀 */
router.post('/readmsg', function (req, res, next) {
    // 得到請求中的 from.to , 更新特定人發送給當前使用者的訊息
    const fromId = req.body.from
    const ToId = req.body.to   
    console.log(fromId)
    console.log(ToId)

    // 更新
    chat.updateMany({ fromId, ToId, read: false },{ $set: { read: true } }, (err, oldChats) => {
        // 返回更新的數量 讓前端可以計算總共的未讀數量 oldChats.nModified)
        console.dir(oldChats)
        res.send(new apiRes.SuccessResponse(oldChats.nModified)) // 更新的数量
    })
});

module.exports = router;