var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5');
const jwt = require('jsonwebtoken');
const member = require('../db/model/member');
const apply = require('../db/model/apply');
const apiRes = require('./../db/apiResponse');
const VerifyJWT = require('./../middleware/VerifyJWT');
const multer = require('multer');
const base64Img = require('base64-img');

const proj = { password: 0, __v: 0, base: 0, _id: 0 } //過濾欄位
const proj1 = { password: 0, __v: 0, base: 0 } //過濾欄位
const proj2 = { _id: 0, __v: 0, base: 0 } //過濾欄位



// 交友申請(喜歡:1 不喜歡:2)
router.post('/userIsLike', VerifyJWT(), function (req, res) {
    const { UserId, ToUserId, status } = req.body
    apply.findOne({ UserId, ToUserId }, 'UserId ToUserId status', (err, inner) => {
        if (err) {
            console.log(err)
        }
        if (inner) { // 已經存在交友申請
            res.send(new apiRes.FailResponse('已經申請過了'))
        }
        else { //新增
            new apply({ UserId, ToUserId, status }).save((err, applied) => {
                if (err) {
                    console.log(err)
                }
                if (applied) {
                    const data = { UserId, ToUserId, status }
                    res.send(new apiRes.SuccessResponse(data))
                }
            })
        }
    })
});

// 交友申請(喜歡) 雙方 查詢
router.post('/FindUserIsLike', VerifyJWT(), function (req, res) {
    const { UserId, ToUserId } = req.body
    apply.findOne({ UserId, ToUserId }, proj2, (err, inner) => {
        if (err) {
            console.log(err)
        }
        if (inner) { // 已經存在交友申請
            res.send(new apiRes.SuccessResponse(inner))
        }
        else { //新增
            res.send(new apiRes.FailResponse('沒有資料'))
        }
    })
});


async function isNotApplied(AllApply, userId) { //回傳自己尚未回應過的申請
    let rest = []//未申請
    for (let i = 0; i < AllApply.length; i += 1) {
        try { //找尋未申請過
            let result = await apply.findOne({ UserId: userId, ToUserId: AllApply[i].UserId })
            if (!result) {
                try { //找尋個人資料
                    let user = await member.findById({ _id: AllApply[i].UserId }, 'name _id photo age')
                    rest.push({ name: user.name, age: user.age, avatar: user.photo[0], UserId: AllApply[i].UserId });
                } catch (error) {
                    console.log(err)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
    return rest
}

// 交友申請列表 查詢
router.post('/ApplyList', VerifyJWT(), function (req, res) {
    const { UserId } = req.body
    let rest = []//未申請的
    apply.find({ ToUserId: UserId }, proj2, async (err, AllApply) => {
        if (err) {
            console.log(err)
        }
        if (AllApply) { // 對方對你申請(喜歡或不喜歡)
            isNotApplied(AllApply, UserId)
                .then((result) => {
                    res.send(new apiRes.SuccessResponse(result))
                })
                .catch((err) => { console.log(err) })
        }
        else {
            res.send(new apiRes.FailResponse('沒有資料'))
        }
    })
});

module.exports = router;