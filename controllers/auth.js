const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: "/auth",
        pageTitle: "Login",
        isAuthenticated: req.session.isLoggedIn
    });
}
exports.postLogin = (req, res, next) => {
    User.findById('69f2346f414aac7d7d7e37ae').then(user => {
        req.session.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            cart: user.cart
        }
        req.session.isLoggedIn = true;
        return req.session.save((err) => {
            console.log(err);
            res.redirect('/products')
        });
    }).catch(err => console.log(err));

}
exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}
exports.postSignUp = (req, res, next) => { }