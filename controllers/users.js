const User = require('../models/user')

module.exports.renderRegistrationForm = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res) => {
    try{
    const {email, username, password} = req.body
    const user = new User({email, username})
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, err => {
        if(err) return next(err)
    
    req.flash('success', `Welcome to YelpCamp, ${user.username}`)
    res.redirect('/campgrounds')
    })
    }
    catch(e){
    req.flash('error', e.message)
    res.redirect('register')
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.logoutUser = (req, res) => {
    req.logout()
    req.flash('success', `You have been logged out.`)
    res.redirect('/campgrounds')
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    console.log(redirectUrl)
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}