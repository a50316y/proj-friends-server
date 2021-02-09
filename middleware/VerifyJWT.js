// middlewares/VerifyJWT.js
const _ = require('lodash');
const jsonwebtoken = require('jsonwebtoken');
const apiRes = require('./../db/apiResponse');
const { reject } = require('lodash');
const SECRET = 'my_secret_key'; // 密碼

function verifyJWT(token) {
    return new Promise((resolve,reject)=>{
        jsonwebtoken.verify(token, SECRET,(err,decoded) =>{
            if(err){
                console.log(err)
                reject(err);
            }
            else{
                resolve(decoded)
            }
        })        
    })

}

module.exports = function () {
    return async function (req, res, next) {
        const jwt = _.get(req, 'headers.authorization');
        if (!jwt) {
            res.send(new apiRes.FailResponse('no token ,請重新登入'));
        }
        else{
            await verifyJWT(jwt)
                .then(decoded => {
                    // console.log(decoded);
                    next(); // next middleware
                })
                .catch(err => { 
                    // res.status(400)
                    res.send(new apiRes.FailResponse('token過期或錯誤,請重新登入'));
                });            
        }
    };
}

// async function verifyJWT(jwt) {
//     if (!jwt) {
//         return Promise.reject(new Error('No JWT'));
//     }
//     const decoded = jsonwebtoken.verify(jwt, SECRET);
//     return decoded;
// }


// module.exports = function (options = {}) {
//     return function (req, res, next) {
//         const jwt = _.get(req, 'headers.authorization');
//         verifyJWT(jwt)
//             .then(decoded => {
//                 console.log(decoded);
//                 next(); // next middleware
//             })
//             .catch(next);
//     };
// }