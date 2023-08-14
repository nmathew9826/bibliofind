const mongoose = require('mongoose');

const config = require('./config')

class DB {
    connect = _ => {
        return new Promise((resolve, reject) => {
            mongoose.connect(config.db_url).
                then(_ => {
                    resolve('DATABASE CONNECTED SUCCESSFULLY')
                })
                .catch(error => {
                    console.log(error)
                    reject(error)
                })
        })
    }
}

module.exports = new DB;