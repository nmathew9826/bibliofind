const orderModel = require("../../models/order")

class Order {
    async postOrder(req, res) {
        try {

            const data = {
                customer_id: req.user_id,
                customer_name: req.user_name,
                products: req.body.products
            };
            const order = await orderModel.create(data)
            console.log(order.products)
            res.json({ order_id: order._id})
        }
        catch (error) {
            console.log(error)
            res.status(500).json({ code: 0 })
        }
    }
    async renderOrderConfirmationPage(req, res) {  
        var isLoggedIn = req.cookies['token']
                if (isLoggedIn === undefined || isLoggedIn == "") {
                    isLoggedIn = false
                } else {
                    isLoggedIn = true
                }
        const order = await orderModel.findById(req.params.id).lean()
        res.render("orderConfirmation", { order, isLoggedIn });
    }
}

module.exports = new Order()