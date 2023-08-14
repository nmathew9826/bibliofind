const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const personSchema = new Schema({
    id: ObjectId,
    person_name: String,
    person_phone: String,
    person_address: String,
    city: String,
    province: String,
    country: String,
    person_email: String,
    password: String,
    postal_code: String,
    is_admin: Boolean
});

const Person = mongoose.model('Persons', personSchema);

module.exports = Person; 