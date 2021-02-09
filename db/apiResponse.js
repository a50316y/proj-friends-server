
// response success 
class SuccessResponse {
    constructor(_data) {
        this.code = 1
        this.data = _data
    }
}
exports.SuccessResponse = SuccessResponse


// response failed
class FailResponse {
    constructor(_msg) {
        this.code = 0
        this.msg = _msg
    }
}
exports.FailResponse = FailResponse