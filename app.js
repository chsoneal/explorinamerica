if(process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express')

const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

const userRoutes = require('./routes/users')
const reviewsRoutes = require('./routes/reviews')
const campgroundsRoutes = require('./routes/campgrounds')
const ExpressError = require('./utils/ExpressError.js')
const flash = require('connect-flash')
const session = require('express-session')
const helmet = require('helmet')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')
const MongoDBStore = require('connect-mongo')
const dbUrl = process.env.DB_URL
const secret = process.env.SECRET
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log("Database connected")
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/', userRoutes)

app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.redirect('/campgrounds')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = "Oh, no. You broke it. :("
    res.status(statusCode).render('error', {err})
})
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`)
})

app.use(helmet())

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css",
    "https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com"
]

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
]

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js",
    "https://kit.fontawesome.com/",
    "https://code.jquery.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
]

const fontSrcUrls = []

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'unsafe-inline'", "'self'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: "blob:",
        objectSrc: [],
        imgSrc: [
            "'self'", "blob:", "data:", "https://res.com/rvrecon/"],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
})
)









