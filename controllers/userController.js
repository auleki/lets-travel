const User = require('../models/user');
const Passport = require('passport');
const { check, validationResult, body } = require('express-validator');


exports.signUpGet = (req, res) => {
    res.render('sign_up', { title: 'Sign Up' });
}

exports.signUpPost = 
[
    check('first_name')
    .isLength({ min: 1 })
    .withMessage('First name must be specified'),
    
    check('surname')
    .isLength({ min: 1 })
    .withMessage('Surname must be specified'),
    

    check('email')
    .isEmail()
    .withMessage('Invalid email address'),

    check('confirm_email')
    .custom((value, { req }) => value === req.body.email)
    .withMessage('Emails do not match'),

    check('password')
    .isLength({ min: 6 })
    .withMessage('Password invalid, password needs to be atleast 6 characters'),

    check('confirm_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Your passwords don\`t match'),

    body('*').trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.render('sign_up', { title: 'Please fix the following errors:', errors: errors.array() });
            return;
        } else {
            // No errors
            const newUser = new User(req.body);
            User.register(newUser, req.body.password, err => {
                if(err) {
                    console.log(err, 'error while registering');
                    return next(err);
                }
                next();
            });
        }
    }

]

exports.loginGet = (req, res) => {
    res.render('login', { title: 'Login' });
}

exports.loginPost = Passport.authenticate('local', {
    successRedirect: '/',
    successFlash: 'You are now logged in',
    failureRedirect: '/login',
    failureFlash: 'Login failed, please try again'
})

exports.logout = (req, res) => {
    req.logout();
    req.flash('info', 'You have been logged out succesfully');
    res.redirect('/');
}

exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.isAdmin) {
        next();
        return;
    } else {
        req.flash('info', 'You are not an admin, what are you looking for');
        res.redirect('/');
    }
}