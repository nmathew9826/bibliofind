const promise = require('bluebird')

const productModel = require('../../models/product')

class ProductValidator {
    async isProductExist(id) {
        const product = await productModel.findOne({ _id: id }).lean()
        console.log(product)
        if (product) {
            return true
        }
        return false
    }
}

module.exports = new ProductValidator()