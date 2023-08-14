const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('../../utils/config.js');
const session = require('express-session');

const userHelper = require('../helpers/userHelper')
const contactMailHelper = require('../helpers/contactMailHelper')
const userValidator = require('../validators/userValidator')
const personModel = require('../../models/person');


class User {
    async register(req, res) {
        try {
            console.log(req.body)
            await userHelper.createUser(req.body, req.file);
            res.redirect('/');
        } catch (error) {
            console.log(error)
            if (req.file) { fs.unlink(req.file.path) }
            res.send("Uh Oh! Something went wrong.")
        }
    }
    async renderLoginPage(req, res) {
        res.render('login');
    }

    async logout(req,res) {
        res.cookie['token'] = ""
    }

    async login(req, res) {
        try {
            const person = await userValidator.signinValidation(req.body)
            console.log("person", person)
            if (!person) {
                res.render("login.hbs", { error: "Incorrect credentials" })
            } else {
                const email = req.body.email
                const token = jwt.sign({ email: email }, config.jwtSecretKey, {
                    expiresIn: 86400
                });

                res.cookie('token', token);
                                            
                if (person.is_admin) {
                    res.redirect('/adminDashboard')
                } else {
                    res.redirect('/')
                }
            }
        } catch (error) {
            console.log(error)
            res.send("Uh Oh! Something went wrong.")
        }
    }

    async getUserProfile(req, res) {
        let email;

        try {
            jwt.verify(req.cookies['token'], config.jwtSecretKey, function (err, decoded) {
                if (err) throw err;
                email = decoded.email;
            })
            const person = await personModel.find({ person_email: email }).lean();
            res.render("updateUserDetails", person[0])

        } catch (error) {
            console.log(error)
            res.send("Uh Oh! Something went wrong.")
        }
    }

    async updateUserDetail(id,res,details){
        try{
            var query = {_id:id};
            var newValues = { $set: 
                {
                    person_name : details.person_name,
                    person_email : details.person_email,
                    person_phone : details.person_phone,
                    person_address : details.person_address,
                    city : details.city,
                    province: details.province,
                    postal_code : details.postal_code,
                }}
            await personModel.updateOne(query, newValues)
            res.redirect("/user-Dashboard")
        }
        catch(error){
            console.log(error)
            res.send("Uh Oh! Something went wrong.")
        }
    }
}

module.exports = new User()