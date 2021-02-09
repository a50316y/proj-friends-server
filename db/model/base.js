const mongoose = require('mongoose');

const base = mongoose.Schema({
    createTime: Date,
    updateTime: Date,
    status: Number // 0 disable 1 enable
});

module.exports = base.obj