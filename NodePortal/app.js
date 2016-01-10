//@author Kiran Gaitonde

// npm libraries
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var http = require('http');
var fs = require('fs');
var httpPost = require('http-post');
var nodemailer = require('nodemailer');
var httpProxy = require('http-proxy');
var browserify = require('http-proxy');


// custom libraries

var route = require('./route');
var Model = require('./model');
var prop = require('./properties');



/********************************/

var app = express();

passport.use(new LocalStrategy(function(username, password, done) {
   new Model.User({username: username}).fetch().then(function(data) {
      var user = data;
      if(user === null) {
         return done(null, false, {message: prop.invalidUserMsg});
      } else {
         user = data.toJSON();
         if(!bcrypt.compareSync(password, user.password)) {
            return done(null, false, {message: prop.invalidUserMsg});
         } else {
            return done(null, user);
         }
      }
   }).otherwise(function (err) {
        console.log(err.message);
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
   new Model.User({username: username}).fetch().then(function(user) {
      done(null, user);
   }).otherwise(function (err) {
        console.log(err.message);
    });
});

//app.set('port', process.env.PORT || prop.appPort);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session( 
    {
        secret: prop.sessionSecret, 
        rolling: true , 
        resave: true,
        saveUninitialized : true,
        cookie: { maxAge: prop.normalSessionTime }
    }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/views'));





/********************************/

if (prop.maintenanceStat) {
    //maintenance
    // GET
    app.get('/*', route.maintenance);
} else {
    //index
    // GET
    app.get('/', route.index);
    
    //Contact
    //Post
    app.post('/contact', route.contact);

    
    //home
    // GET
    app.get('/home', route.home);
    
    // login
    // GET
    app.get('/login', route.login);
    // POST
    app.post('/login', route.loginPost);
    
    // logout
    // GET
    app.get('/signout', route.signOut);
    
    //skyspark logout
    app.get('/auth/logout', route.skySignOut);
    app.get('/auth/demo/login', route.skySignOut);
    
    //skyspark project, get login info
    //GET
    app.get('/project/:id', route.project);
    
    
    //proxy skyspark
    //GET 
    app.get('/proj/*', route.skyspark);
    app.get('/pod/*', route.skyspark);
    app.get('/util/*', route.skyspark);
    app.get('/branding/*', route.skyspark);
    app.get('/doc/*', route.skyspark);
    //post
    app.post('/api/*', route.skyspark);
    
    
    // email password
    // GET
    app.get('/email', route.email);
    // POST
    app.post('/email', route.emailPost);
    
    
    //admin 
    //GET
    app.get('/admin', route.admin);    
    
    // add user
    // POST
    app.post('/adduser', route.addUser);
    
    // remove user
    // POST
    app.post('/removeuser', route.removeUser);
    
    // add project
    // POST
    app.post('/addproject', route.addProject);
    
    // remove project
    // POST
    app.post('/removeproject', route.removeProject);
    
    // assign user project
    // POST
    app.post('/assignuserproject', route.assignUserProject);
    
    // unassign user project
    // POST
    app.post('/unassignuserproject', route.unassignUserProject);
    
    
    
    // change password
    // GET
    app.get('/changePwd', route.changePwd);
    // POST
    app.post('/changePwd', route.changePwdPost);
    
    
    // 404 not found
    app.use(route.notFound404);

}

/********************************/



/*
var server = app.listen(app.get('port'), function(err) {
   if(err) throw err;

   var message = 'Server is running @ http://localhost:' + server.address().port;
   console.log(message);
});
*/


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



/********************************/
// exports

module.exports = app;