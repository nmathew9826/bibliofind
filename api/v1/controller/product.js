const productModel = require("../../models/product")
const path = require('path')

class Product {
    async renderProductDetailsPage(req, res) {
        const product = await productModel.findById(req.params.id).lean()
        console.log(product)
        res.render("productDetails", { product });
    }
    async renderHomepage(req, res) {
        try {
            const products = await productModel.find({}).lean()
            var isLoggedIn = req.cookies['token']
            if (isLoggedIn === undefined || isLoggedIn == "") {
                isLoggedIn = false
            } else {
                isLoggedIn = true
            }
            res.render("home", { products, isLoggedIn });
            return true
        } catch (error) {
            console.log(error)
            res.send("Uh Oh! Something went wrong.")
            return false
        }
    }

    async listProduct(req, res) {
        try {
            var isLoggedIn = req.cookies['token']
            if (isLoggedIn === undefined || isLoggedIn == "") {
                isLoggedIn = false
            } else {
                isLoggedIn = true
            }
            res.render("listItem", { isLoggedIn });
        }
        catch (error) {
            console.log(error)
            res.send("Uh Oh! Something went wrong.")
        }
    }

    async addProduct(req, res) {
        try {
            //var query = {_id:id};
            const { image } = req.files;
            var image_name = "";
            const dirPath = path.join(__dirname, '../../../public/images/');
            // If no image submitted, exit
            if (image) {
                 // Move the uploaded image to our upload folder
            image.mv(dirPath + image.name);
            image_name=image.name;
            }
            const data = {
                product_name: req.body.product_name,
                product_description: req.body.product_description,
                product_price: req.body.product_price,
                seller: req.body.seller,
                image_name: image_name
            }
            // await productModel.updateOne(query, newValues)
            await productModel.create(data);

            res.redirect("/user-dashboard")
        }
        catch (error) {
            console.log(error)
            res.send("Uh Oh! Something went wrong.")
        }
    }

    async renderCartPage(req, res) {
        var isLoggedIn = req.cookies['token']
                if (isLoggedIn === undefined || isLoggedIn == "") {
                    isLoggedIn = false
                } else {
                    isLoggedIn = true
                }

        if(isLoggedIn){
            res.render("cart", {isLoggedIn});
        }else {
            res.render('login');
        }
        
    }
}

module.exports = new Product()