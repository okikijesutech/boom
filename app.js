require("dotenv").config();
const express = require('express');
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));


app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URL);

const userSchema = new mongoose.Schema ({
  username: {
    type: String,
    required: true,
    unique: true
  },
  pasword: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
  res.render("home")
});

app.get("/featured", (req, res) => {
  res.render("featured")
})

app.get("/profile", (req, res) => {
  res.render("profile")
})

app.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("porfile")
  } else {
    res.redirect('/login')
  }
});

app.post('/signup', (req, res) => {
  User.register({ username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
    } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/profile")
        });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login")
});

app.post('/login', function (req, res) {
  const user = new User ({
    username: req.body.username,
    password: req.body.password
  });


  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/profile")
      });
    }
  });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/")
});

const port = process.env.PORT;

if (port == null || port == "") {
  port = 8000;
}

app.listen(port, () => {
  console.log('Server up and running');
});
