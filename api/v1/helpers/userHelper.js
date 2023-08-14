const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const promise = require('bluebird')

const db = require('../../utils/db')
const mailHelper = require('./mailHelper')
const config = require('../../utils/config')
const personModel = require('../../models/person')

class UserHelper {
    async createUser(body) {
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(body.password, salt);
        const data = {
            person_name: body.fullname,
            person_phone: body.pphonenumber,
            person_address: body.address,
            city: body.pcity,
            province: body.pstate,
            country: body.country,
            person_email: body.email,
            password: password,
            postal_code: body.pzip,
            is_admin: false
        }
        try {
            await personModel.create(data)
            return true
        } catch (error) {
            return promise.reject(error)
        }
    }
    async forgotPassword(email) {
        try {
            const person = await personModel.find({ person_email: email }).lean();
            console.log(person)
            if (person.length == 0) {
                return false
            } else {
                let token = jwt.sign({ id: person[0]._id }, config.jwtSecretKey, {
                    expiresIn: 600
                });
                await mailHelper.sendForgetPasswordMail(person[0].person_email, token, person[0].person)
                return true
            }
        } catch (error) {
            console.log(error)
            return promise.reject(error)
        }
    }
    async resetPassword(token, password, cpassword) {
        try {
            console.log(password, cpassword)
            if (password != cpassword) {
                return 0
            } else {
                return new Promise((resolve, reject) => {
                    jwt.verify(token, config.jwtSecretKey, async function (err, decoded) {
                        if (err) {
                            //console.log(err.name)
                            if (err.name === 'TokenExpiredError') {
                                resolve(1)
                            }
                            throw err;
                        }
                        const salt = bcrypt.genSaltSync(10);
                        const new_password = bcrypt.hashSync(password, salt);
                        const data = {
                            password: new_password,
                        }
                        //console.log(decoded)
                        //console.log(data)
                        await personModel.findByIdAndUpdate(decoded.id, data)
                        resolve(2)
                    });
                })
            }
        } catch (error) {
            console.log(error)
            return promise.reject(error)
        }
    }
    async updateIsActive(flag, id) {
        let data = {
            is_active: flag,
            modified_date: DateHelper.getCurrentTimeStamp()
        }
        let condition = `Where user_id='${id}'`
        try {
            await db.update('users', condition, data)
            return 'UPDATE_USER_SUCCESS'
        } catch (error) {
            return promise.reject(error)
        }
    }
    async getUserFromToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.jwtSecretKey, async function (err, decoded) {
                try {
                    if (err) {
                        console.log(err.name)
                        if (err.name === 'TokenExpiredError') {
                            reject(err)
                        }
                        throw err;
                    }
                    const user = await personModel.findOne({ email: decoded.email }).lean()
                    resolve(user)
                } catch (error) {
                    console.log(error)
                }
            });
        })
    }

    async updateUserDetails(id) {
        let data = {
            is_active: flag,
            modified_date: DateHelper.getCurrentTimeStamp()
        }
        let condition = `Where user_id='${id}'`
        try {
            await db.update('users', condition, data)
            return 'UPDATE_USER_SUCCESS'
        } catch (error) {
            return promise.reject(error)
        }
    }
}

module.exports = new UserHelper()