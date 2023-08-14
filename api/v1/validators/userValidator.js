const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const promise = require('bluebird')

const personModel = require('../../models/person')
const { getUserFromToken } = require('../helpers/userHelper')
const config = require('../../utils/config.js');

class UserValidator {
    async signinValidation(body) {
        try {
            console.log(body)
            const person = await personModel.find({ person_email: body.email }).lean();
            console.log(person)
            if (person.length == 0) { return false }
            else {
                const db_password = person[0].password;
                const isValid = bcrypt.compareSync(body.password, db_password)
                if (!isValid) { return false }
                else {
                    return person[0]
                }
            }
        } catch (error) {
            return promise.reject(error)
        }
    }
    async isUserLoggedIn(req, res, next) {
        // console.log(req.headers)
        if (req.headers.token && req.headers.token === undefined && req.headers.token === null) {
            responseHelper.error(res, 'LOGIN_FIRST', req.headers.language, {})
        } else {
            let token = req.headers.token
            jwt.verify(token, 'this is secret key', function (err, decoded) {
                if (err) {
                    responseHelper.error(res, 'TOKEN_EXPIRED', req.headers.language, {})
                }
                else {
                    req.email = decoded.email
                    next();
                }
            });
        }
    }
    getCookies(cookiesText) {
        const list = {}
        if (cookiesText) {
            cookiesText.split(`;`).forEach(function (cookie) {
                let [name, ...rest] = cookie.split(`=`);
                name = name?.trim();
                if (!name) return;
                const value = rest.join(`=`).trim();
                if (!value) return;
                list[name] = decodeURIComponent(value);
            });
        }
        return list
    }
    isUserLoggedinAndActive = async (req, res, next) => {
        try {
            //console.log(req.headers.cookie)
            const cookies = this.getCookies(req.headers.cookie)
            if (cookies && cookies.token) {
                //const user = await getUserFromToken(cookies.token)
                //console.log(user)
                let email;
                jwt.verify(req.cookies['token'], config.jwtSecretKey, function (err, decoded) {
                    console.log(decoded)
                    if (err) throw err;
                    email = decoded.email;
                })
                const person = await personModel.find({ person_email: email }).lean();
                console.log(person)
                //if (user && user.is_active)
                // if (user) {
                //     req.user_id = user._id
                //     req.user_name = user.person_name
                //     next()
                // } else {
                //     res.redirect('/')
                // }
                if (person) {
                    req.user_id = person[0]._id
                    req.user_name = person[0].person_name
                    next()
                } else {
                    res.redirect('/')
                }
            } else {
                res.redirect('/')
            }
        } catch (error) {
            console.log(error)
            res.redirect('/')
        }
    }
    isAdmin = async (req, res, next) => {
        try {
            const cookies = this.getCookies(req.headers.cookie)
            console.log(req.headers.cookie, cookies)
            if (cookies && cookies.token) {
                const user = await getUserFromToken(cookies.token)
                if (user && user.is_admin) {
                    next()
                } else {
                    res.redirect('/')
                }
            } else {
                res.redirect('/')
            }
        } catch (error) {
            console.log(error)
            res.redirect('/')
        }
    }
    async isUserExist(id) {
        let user = await personModel.findById(id)
        console.log(user)
        if (user.length < 1) {
            return promise.reject('NO_USER_FOUND')
        }
        return true
    }

    async verifyResetToken(req, res, next) {
        try {
            let token = req.params.token
            jwt.verify(token, 'this is secret key', function (err, decoded) {
                if (err) { throw err }
                next()
            });
        } catch (error) {
            responseHelper.error(res, 'TOKEN_EXPIRED', req.headers.language, {})
        }
    }

}

module.exports = new UserValidator()