const express = require("express");
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const product = require("./api/v1/controller/product");
const config = require("./api/utils/config");
const db = require("./api/utils/db");
const user = require("./api/v1/controller/user");
const userDashboard = require("./api/v1/controller/userDashboard");
const order = require("./api/v1/controller/order");
const { isAdmin, isUserLoggedinAndActive, getCookies } = require("./api/v1/validators/userValidator")
var cookieParser = require('cookie-parser');

const HTTP_PORT = process.env.PORT|| config.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        dateEqual: function(value, options) {
            let date_ob = new Date(Date.now());
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let current = date_ob.getFullYear() + "-" + month + "-" + date_ob.getDate();
            if(value===current)
            {
                return options.fn(this);            
               
            }
            else{
                return options.inverse(this);                                      
            }
        },
        formatDate: function(date) {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            return new Date(date).toLocaleDateString('en-US', options);
          }
    }
}));

app.set('view engine', '.hbs');

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.use(fileUpload());

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

app.use(cookieParser());

app.get("/", product.renderHomepage);
app.get("/product-details/:id", product.renderProductDetailsPage);
app.get("/login", user.renderLoginPage);

app.get("/registration", (req, res) => {
    res.render("registration.hbs");
});

app.get("/contact-us", (req, res) => {
    var isLoggedIn = req.cookies['token']
    if (isLoggedIn === undefined || isLoggedIn == "") {
        isLoggedIn = false
    } else {
        isLoggedIn = true
    }
    res.render("contactUs",{isLoggedIn});
});

app.get("/aboutUS", (req, res) => {
    var isLoggedIn = req.cookies['token']
    if (isLoggedIn === undefined || isLoggedIn == "") {
        isLoggedIn = false
    } else {
        isLoggedIn = true
    }
    res.render("aboutUS",{isLoggedIn});
});

app.get("/user-dashboard", userDashboard.getUser);
app.get("/userprofile/update", userDashboard.getUserEdit);
app.get("/listproducts", product.listProduct);
app.get("/orderConfirmation/:id", order.renderOrderConfirmationPage);
app.get("/cart", product.renderCartPage);

app.post("/register", user.register);
app.post("/login", user.login);

app.post("/addProduct", product.addProduct);

app.post("/userprofile/update/:id", (req, res) => {
    user.updateUserDetail(req.params.id, res, req.body)
})

app.post("/order", isUserLoggedinAndActive, order.postOrder)

app.post("/logout", (req,res)=>{
    res.cookie('token', "");
    res.redirect("/")
});

db.connect()
    .then(response => {
        console.log(response)
        app.listen(HTTP_PORT, async () => {
            console.log("server listening on port: " + HTTP_PORT);
        });
    })
    .catch(error => {
        console.log(error)
    })