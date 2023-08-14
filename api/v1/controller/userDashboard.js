const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('../../utils/config.js');
const personModel = require('../../models/person');
const orderModel = require('../../models/order');
const session = require('express-session');
var promise = require('promise');

class UserDashboard {
    async getUser(req, res) {
        let user_id;
        let email;
        const token = req.cookies['token'];
        try {
            if (token == undefined || token =='') {
                res.render("login");
            }
            else {
                jwt.verify(req.cookies['token'], config.jwtSecretKey, function (err, decoded) {
                    if (err) throw err;
                    email = decoded.email;
                })
                try {

                    const person = await personModel.find({ person_email: email }).lean();
                    user_id = person[0]._id;
                    const order = await orderModel.find({ customer_id: user_id }).lean();
                    

                    var isLoggedIn = req.cookies['token']
                    if (isLoggedIn === undefined || isLoggedIn == "") {
                        isLoggedIn = false
                    } else {
                        isLoggedIn = true
                    }
                    console.log(order[0].products)
                    res.render("userDashboard", { person: person[0], order: order, isLoggedIn });

                } catch (error) {
                    console.log(error)
                    return promise.reject(error)
                }
            }

        } catch (error) {
            console.log(error)
            return promise.reject(error)
        }
    }
    async getUserEdit(req, res){
        let user_id;
        let email;
        const token = req.cookies['token'];
        try {
            if (token == undefined || token =='') {
                res.render("login");
            }
            else {
                jwt.verify(req.cookies['token'], config.jwtSecretKey, function (err, decoded) {
                    if (err) throw err;
                    email = decoded.email;
                })
                try {

                    const person = await personModel.find({ person_email: email }).lean();
                    user_id = person[0]._id;
                    //const order = await orderModel.find({ customer_id: user_id }).lean();
                    const order = [];

                    var isLoggedIn = req.cookies['token']
                    if (isLoggedIn === undefined || isLoggedIn == "") {
                        isLoggedIn = false
                    } else {
                        isLoggedIn = true
                    }

                    res.render("editProfile", { person: person[0], isLoggedIn });

                } catch (error) {
                    console.log(error)
                    return promise.reject(error)
                }
            }

        } catch (error) {
            console.log(error)
            return promise.reject(error)
        }
    }
}

module.exports = new UserDashboard();
