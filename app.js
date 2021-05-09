let express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    {connect} = require("mongoose"),
    passport = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash = require("connect-flash"),
    Room = require("./models/room"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    session = require("express-session"),
    methodOverride = require("method-override");
// configure dotenv
require('dotenv').config();

//requiring routes
var commentRoutes = require("./routes/comments"),
    roomRoutes = require("./routes/rooms"),
    indexRoutes = require("./routes/index")

// assign mongoose promise library and connect to database

connect("mongodb://localhost:27017/to_let",
    {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
    }).then( () => {
        // listening on specified port 
        app.listen(process.env.PORT || 8080,()=>{
            console.log("Server Started At PORT : "+process.env.PORT || 8080);
            });
    })
    .catch( (error)=>{
            console.log("Server Couldn't be started due to Database Connection failure!");
    });


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.use("/", indexRoutes);
app.use("/rooms", roomRoutes);
app.use("/rooms/:id/comments", commentRoutes);
