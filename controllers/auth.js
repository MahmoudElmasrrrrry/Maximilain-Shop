const User = require("../models/user");
const bcrypt = require("bcryptjs")
exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    message.length > 0 ? message = message[0] : message = null;
    res.render('auth/login', {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message
    });
}

exports.getSignUp = (req, res, next) => {
    let message = req.flash('error');
    message.length > 0 ? message = message[0] : message = null;
    res.render('auth/signup', {
        path: "/signup",
        pageTitle: "SignUp",
        errorMessage: message
    });

}

exports.postSignUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.password;

    User.findOne({ email }).then(user => {
        if (user) {
            req.flash("error", "Email is already exist")
            return res.redirect('/signup')
        }
        return bcrypt.hash(password, 10)
            .then(hashedPassword => {
                const user = new User({
                    email: email,
                    password: hashedPassword,
                    cart: { items: [] }
                })
                return user.save();
            })
            .then(result => {
                return res.redirect('/login');
            })
            .catch(err => {
                console.log(err);
            })
    }).catch(err => {
        console.log(err);
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password

    User.findOne({ email }).then(user => {
        if (!user) {
            req.flash('error', "In-valid email or password");
            return res.redirect('/login')
        }
        return bcrypt.compare(password, user.password)
            .then(isMatch => {
                if (!isMatch) {
                    req.flash('error', "In-Valid email or password")
                    return res.redirect('/login')
                }
                req.session.user = {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    cart: user.cart
                }
                req.session.isLoggedIn = true;
                return req.session.save((err) => {
                    if (err) console.log(err);
                    res.redirect('/')
                });
            })
            .catch(err => {
                console.log(err);

            })
    }).catch(err => console.log(err));

}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/');
    });
}