const mongoose = require('mongoose');
const baseSchema = require('./base');


const apply = mongoose.Schema({
    UserId: {
        type: String,
        required: true
    },
    ToUserId: {
        type: String,
        required: true
    },
    status: { // 0 未決定 1 喜歡 2 不喜歡 3 封鎖 4 隱藏
        type: String,
        required: true
    },
    base: baseSchema

});


// pre : 類似攔截器 , 在執行某樣動作前(ex:save.find ...) , 將其攔截住做一些處理 , 這裡是攔截住往裡面塞基本資料
// 新增
apply.pre(['save', 'create'], function (next) {
    this.base.createTime = new Date()
    this.base.updateTime = new Date()
    this.base.status = 1
    next()
});

// 修改
// findOneAndUpdate 是 findByIdAndUpdate 的 wrapper 所以會導到這裡
apply.pre('findOneAndUpdate', function (next) {
    this.getUpdate().$set['base.updateTime'] = new Date()
    console.log("時間在這裡")
    console.log(this.getUpdate())
    next()
});



module.exports = mongoose.model('apply', apply)