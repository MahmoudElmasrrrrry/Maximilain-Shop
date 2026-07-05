const User = require("../models/user");
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer");
const { validationResult } = require('express-validator');
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: " mahmoudelmasry853j@gmail.com",
        pass: 'qzzx kxsg gjwn vonq'
    }
})

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    message.length > 0 ? message = message[0] : message = null;
    res.render('auth/login', {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
        oldContent: {
            email: "",
            password: ""
        },
        validationErrors: []
    });
}

exports.getSignUp = (req, res, next) => {
    let message = req.flash('error');
    message.length > 0 ? message = message[0] : message = null;
    res.render('auth/signup', {
        path: "/signup",
        pageTitle: "SignUp",
        errorMessage: message,
        oldContent: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: []
    });

}

exports.postSignUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            path: "/signup",
            pageTitle: "SignUp",
            errorMessage: errors.array()[0].msg,
            oldContent: {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    bcrypt.hash(password, 10)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            })
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'test@shop.com',
                subject: 'SignUp Success',
                html: '<h1>Signed Up Successfully</h1>'
            })
        })
        .catch(err => {
            console.log(err);
        })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/login', {
            path: "/login",
            pageTitle: "Login",
            errorMessage: errors.array()[0].msg,
            oldContent: {
                email: email,
                password: password,
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email }).then(user => {
        if (!user) {
            return res.status(422).render('auth/login', {
                path: "/login",
                pageTitle: "Login",
                errorMessage: "Invalid email or password",
                oldContent: {
                    email: email,
                    password: password,
                },
                validationErrors: []
            });
        }
        return bcrypt.compare(password, user.password)
            .then(isMatch => {
                if (!isMatch) {
                    return res.status(422).render('auth/login', {
                        path: "/login",
                        pageTitle: "Login",
                        errorMessage: "Invalid email or password",
                        oldContent: {
                            email: email,
                            password: password,
                        },
                        validationErrors: []
                    });
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

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    message.length > 0 ? message = message[0] : message = null;
    res.render('auth/reset-password', {
        path: "/reset-password",
        pageTitle: "Reset Password",
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset-password');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', "No account with that email found.");
                    return res.redirect('/reset-password');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save()
                    .then(result => {
                        res.redirect('/');
                        return transporter.sendMail({
                            to: req.body.email,
                            from: 'test@shop.com',
                            subject: 'Reset Password',
                            html: `
                            <p>You requested a password reset</p>
                            <p>Click this link to reset your password: <a href="http://localhost:3000/reset-password/${token}">Reset Password</a></p>
                        `
                        })
                    });
            })
            .catch(err => {
                console.log(err);
            });
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/reset-password');
            }
            let message = req.flash('error');
            message.length > 0 ? message = message[0] : message = null;
            res.render('auth/new-password', {
                path: "/new-password",
                pageTitle: "New Password",
                errorMessage: message,
                userId: user._id.toString(),
                token: token
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.token;
    let resetUser;

    User.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 10);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        });
}