const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSchema = new Schema({
    id: ObjectId,
    product_name: String,
    product_price: Number,
    product_description: String,
    seller: String,
    image_name: String
});

const Product = mongoose.model('products', productSchema);

module.exports = Product; 