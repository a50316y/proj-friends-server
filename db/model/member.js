const mongoose = require('mongoose');
const baseSchema = require('./base');


 const memberSchema = mongoose.Schema({
   account:{
       type: String,
       required:true
   },
   password:{
       type:String,
       required:true
   },
   male:{ // 0 woman 1 man
       type:String,
       required:true
   },
   photo:{
       type:Array,
       default:[]
   },
   name:{
       type:String,
       required: true
   },
   age:{
       type:String,
       default:""
   },
   height:{ //身高
       type: String,
       default: ""
   },
   education:{ //學歷
       type: String,
       default: ""
   },
   bloodType:{ //血型
       type: String,
       default: ""
   },
   city:{ //城市
       type: String,
       default: ""
   },
   career:{ //職業
       type: String,
       default: ""
   },
   info:{ //自我介紹
       type:String,
       default:""
   },
   base: baseSchema

 });


// pre : 類似攔截器 , 在執行某樣動作前(ex:save.find ...) , 將其攔截住做一些處理 , 這裡是攔截住往裡面塞基本資料
// 新增
memberSchema.pre(['save', 'create'], function (next) {
    this.base.createTime = new Date()
    this.base.updateTime = new Date()
    this.base.status = 1
    next()
});

// 修改
// findOneAndUpdate 是 findByIdAndUpdate 的 wrapper 所以會導到這裡
memberSchema.pre('findOneAndUpdate', function (next) {
    this.getUpdate().$set['base.updateTime'] = new Date()
    console.log("時間在這裡")
    console.log(this.getUpdate())
    next()
});



module.exports = mongoose.model('member', memberSchema)