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

router.get('/', async (req, res) => { //回傳所有使用者資料
  try {
    const post = await member.find({}, proj);
    // res.header('Access-Control-Allow-Origin', '*'); // 讓cors不會擋
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post('/register', function (req, res) { // 接收參數
  const { account, password, male, name, age } = req.body
  // 處理參數
  // 帳號存在 不給註冊
  member.findOne({ account }, (err, user) => {
    if (err) {
      console.log(err)
    }
    if (user) {
      res.send(new apiRes.FailResponse('帳號已存在'))
    } 
    else {// 新增
      new member({ account, password: password, male, name, age }).save((err, user) => {
        if (err) {
          console.log(err)
        }
        if (user) { // 生成 cookie 交由瀏覽器保存 (一天)
          // res.cookie('userid', user._id, { maxAge: 24 * 60 * 60 * 1000, httpOnly: false })
          const data = { account, male, name, age, _id: user._id }
          res.send(new apiRes.SuccessResponse(data))
        }
      })
    }
  }
  )
});

// 登入
router.post('/login', function (req, res) {
  // 接收參數
  const { account, password } = req.body
  // 處理參數
  member.findOne({ account, password }, 'account _id photo name', (err, user) => {
    if (err) {
      console.log(err)
    }
    if (user) { // 登入成功  // 生成 JWT token (一天)
      console.log(user);
      const token = jwt.sign({ user, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }, 'my_secret_key')
      // const token = jwt.sign({ user, exp: Math.floor(Date.now()/1000) + (30)}, 'my_secret_key' )
      // res.clearCookie('userid')
      // res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
      res.send(new apiRes.SuccessResponse({ token: token, userId: user._id, avatar: user.photo[0], userName: user.name}))
    } else {
      // 登入失敗
      res.send(new apiRes.FailResponse('查無帳號或是密碼錯誤'))
    }
  })
});

// 修改個人資料 照片不會修改 需呼叫另一支api
router.post('/update',VerifyJWT(), function (req, res) {
  // 接收參數
  const userInfo = req.body

  // // 更新
  member.findOneAndUpdate({ _id: userInfo.userId }, { $set: userInfo },{ new: true }, (err, update) => {
    if (err) {
      console.log(err)
    }

    if (!update) {// 失敗 根據userId 資訊查詢 
      res.send(new apiRes.FailResponse('沒有此userId'))
    } else { // 修改成功
      const {  male, name, age, info, height, education, city, bloodType, career} = update
      const fullInfo = {  male, name, age, info, height, education, city, bloodType, career}
      res.send(new apiRes.SuccessResponse(fullInfo))
    }
  })
});

// 修改照片 不會修改其他個人資料
router.post('/updateImg', VerifyJWT(), function (req, res) {
  // 接收參數
  const userInfo = req.body

  // // 更新
  member.findOneAndUpdate({ _id: userInfo.userId }, { $set: userInfo }, { new: true }, (err, update) => {
    if (err) {
      console.log(err)
    }

    if (!update) {// 失敗 根據userId 資訊查詢 
      res.send(new apiRes.FailResponse('沒有此userId'))
    } else { // 修改成功
      const { photo } = update
      const fullInfo = { photo }
      res.send(new apiRes.SuccessResponse(fullInfo))
    }
  })
});

// 返回 user 個人資訊
router.post('/user', VerifyJWT(), function (req, res) {
  const userId = req.body.userid

  member.findById({ _id: userId }, proj, (err, user) => {
    if (err) {
      console.log(err)
    }

    if (!user) {
      // 根據 userid 資訊查詢 , 找不到代表userid 錯誤
      res.send(new apiRes.FailResponse('沒有此userId'))
    } else {
      res.send(new apiRes.SuccessResponse(user))
    }
  })
});

async function isApplied(AllUser, userId,option) { //檢查是否申請過 回傳未申請過的user
  let rest = []//未申請的
  let applied = [] //已申請的
  for (let i = 0; i < AllUser.length; i++) {
    try {
      let inner = await apply.findOne({ UserId: userId, ToUserId: AllUser[i]._id })
      if (inner) { // 已經存在交友申請(喜歡的才會顯示 status:1 )
        if (inner.status == '1') // console.log('此人已申請過了')
          applied.push(AllUser[i])
      } 
      else {
        rest.push(AllUser[i])
      }
    } catch (err) {
      console.log(err)
    }
  }
  if (option == 'NotApplied')
    return rest
  if( option == 'Applied') 
    return applied
}

// 返回(除本人外的)其他user資訊
router.post('/getAllUser', VerifyJWT(), function (req, res) {
  const userId = req.body.userId
  const option = req.body.option
  // console.log(option)
  member.find({ _id: { $nin: userId } }, proj1, (err, AllUser) => {
    if (err) {
      console.log(err)
    }
    if (!AllUser) { // 根據 userid 資訊查詢 , 
      res.send(new apiRes.FailResponse('沒有資料'))
    } 
    else {
        isApplied(AllUser,userId,option)
        .then((result) =>{
          res.send(new apiRes.SuccessResponse(result))
        })
        .catch((err) => { console.log(err) })        
      
    }
  })
});

async function getFriends(AllApply, userId) { //回傳朋友列表
  let friends = []//未申請
  for (let i = 0; i < AllApply.length; i += 1) {
    if (AllApply[i].status == '1'){ //對方喜歡我
      try { //查詢我是否喜歡對方
        let result = await apply.findOne({ UserId: userId, ToUserId: AllApply[i].UserId })
        if (result && result.status == '1') { //有回應過對方申請且喜歡對方
          try { //找尋個人資料
            let user = await member.findById({ _id: AllApply[i].UserId }, 'name _id photo')
            friends .push({ name: user.name, avatar: user.photo[0], UserId: user._id });
          } catch (error) {
            console.log(err)
          }
        }
        else {//尚未回應過對方申請
          // console.log('尚未回應過對方申請')
        }
      } catch (err) {
        console.log(err)
      }      
    }

  }
  return friends 
}


// 返回friendList資訊
router.post('/getFriendList', VerifyJWT(), function (req, res) {
  const UserId = req.body.UserId
  apply.find({ ToUserId: UserId }, proj2, async (err, AllApply) => {
    if (err) {
      console.log(err)
    }
    if (AllApply) { // 對方對你申請(喜歡或不喜歡)
      getFriends(AllApply, UserId)
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


// 存image測試 by base64
router.post('/uploadImg', VerifyJWT(),function (req, res) {
  const { image } = req.body
  base64Img.img(image, 'public/images', 'image-'+ Date.now(), function (err, filepath){
    const pathArr = filepath.split('\\')
    // console.log(pathArr);
    const fileName = pathArr[pathArr.length - 1];
    if(err){
      res.send(new apiRes.FailResponse('圖片上傳錯誤'))
    }
    else{
      res.send(new apiRes.SuccessResponse({
        url: `http://127.0.0.1:3000/images/${fileName}`
      }))    
    }
  });
});

// 存image測試 by file
// const fs = require('fs');
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/images')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// });
// const upload = multer({ storage: storage })
// router.post('/upload', upload.single('image'),function (req, res) {
//   console.log(req.file)
//   let newPath = `public/images/${req.file.originalname}`
//   fs.rename(req.file.path, newPath, () => {
//     res.json({ result: 'image uploaded successful' })
//   })

// });

// try jwt
// router.use(function (req, res, next) {
//   var token = req.body.token || req.query.token || req.headers['x-access-token']
//   if (token) {
//     jwt.verify(token, router.get('my_secret_key'), function (err, decoded) {
//       if (err) {
//         return res.json({ success: false, message: 'Failed to authenticate token.' })
//       } else {
//         req.decoded = decoded
//         next()
//       }
//     })
//   } else {
//     return res.status(403).send({
//       success: false,
//       message: 'No token provided.'
//     })
//   }
// })

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// router.post('/', async (req, res) => {

//   const postMember = new member({
//     account: req.body.account,
//     password: req.body.password,
//     male: req.body.male,
//     name: req.body.name,
//     age: req.body.age
//   });

//   try {
//     const savedPost = await postMember.save();
//     res.json(savedPost);
//   } catch (err) {
//     res.json({ message: err });
//   }
//   // post.save()
//   // .then(data =>{
//   //   res.json(data);
//   // })
//   // .catch(err => {
//   //   res.json({message:err});
//   // });

// });

// router.get('/:postId', async (req, res) => {

//   try {
//     const post = await member.findById(req.params.postId);
//     res.json(post);
//   } catch (err) {
//     res.json({ message: err });
//   }

// });

// router.patch('/:postId', async (req, res) => {

//   try {
//     const updatePost = await member.updateOne(
//       { _id: req.params.postId },
//       { $set: { name: req.body.name } },
//     );
//     res.json(updatePost);
//   } catch (err) {
//     res.json({ message: err });
//   }

// });


module.exports = router;
