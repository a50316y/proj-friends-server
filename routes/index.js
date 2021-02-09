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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET localhost:3000/test. */
// router.get('/test', function (req, res, next) {
//   res.send('this is localhost:3000/test');
// });



module.exports = router;
