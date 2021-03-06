//jshint esversion:6
require('dotenv').config(); // for the environment variable -> our top secret phrase 
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const path = require('path');

const app = express();

app.use(express.static("public"));
// app.use(express.static("pages")); //for node recognaized *.js files inside pages dir.

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "My secret shh..",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/usersDB", {useNewUrlParser : true}) // local DB

const userSchema= new mongoose.Schema({
    email: String,
    password : String,
    // secret: String
});

userSchema.plugin(passportLocalMongoose)//hash & salt our user

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.get('/', function(req,res){
    res.render("home");
});

app.get('/login', function(req,res){
    res.render("login");
});

app.get('/register', function(req,res){
    res.render("register");
});

app.get('/mainPage', function(req,res){
    if(req.isAuthenticated()){
        res.render("mainPage")
    }else{
        res.redirect("/login")
    }
})

app.get("/logout",function(req,res){
    req.logout()
    res.redirect("/")
})

// app.get("/submit", function(req,res){
//     if(req.isAuthenticated()){
//         res.render("submit")
//     }else{
//         res.redirect("/login")
//     }
// })

app.get("/teste", function(req,res){
  res.sendFile(path.resolve("./pages/teste.html"))
})


// app.post("/submit", function(req,res){
//     const submitedSecret = req.body.secret
//     // console.log(req.user)
//     User.findById(req.user.id, function(err, foundUser){
//         if(err){
//             console.log(err)
//         }else{
//             if(foundUser){
//                 foundUser.secret = submitedSecret
//                 foundUser.save(function(){
//                     // res.redirect("secrets")
//                 })
//             }
//         }
//     })

// })

app.post("/register",function(req,res){
    User.register({username:req.body.username} , req.body.password, function(err,user){
        if(err){
            console.log(err)
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/mainPage")
            })
        }
    })
});

app.post("/login", function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user,function(err){
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/mainPage")
            })
        }
    })
})




app.listen(3000,function(){
    console.log("server started on port 3000")
})