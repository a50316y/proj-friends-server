const mongoose = require('mongoose');
const baseSchema = require('./base');

const chat = mongoose.Schema({
    fromId: { //發送人ID
        type: String,
        required: true
    },
    ToId: { //傳給對方的ID
        type: String,
        required: true
    },
    msg: { // 聊天內容
        type: String,
        required: true
    },
    read: { //是否已讀
        type: Boolean, 
        default: false 
    },
    base: baseSchema

});


// pre : 類似攔截器 , 在執行某樣動作前(ex:save.find ...) , 將其攔截住做一些處理 , 這裡是攔截住往裡面塞基本資料
// 新增
chat.pre(['save', 'create'], function (next) {
    this.base.createTime = new Date()
    this.base.updateTime = new Date()
    this.base.status = 1
    next()
});

// 修改
// findOneAndUpdate 是 findByIdAndUpdate 的 wrapper 所以會導到這裡
chat.pre('findOneAndUpdate', function (next) {
    this.getUpdate().$set['base.updateTime'] = new Date()
    console.log("時間在這裡")
    console.log(this.getUpdate())
    next()
});

module.exports = mongoose.model('chat', chat)