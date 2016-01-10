//@author Kiran Gaitonde

// npm libraries
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var httpProxy = require('http-proxy');

// custom libraries
// model
var Model = require('./model');
var prop = require('./properties');
var util = require('./utility');

//proxy server for skyspark
var skyproxy = httpProxy.createProxyServer();  

// ********* Routes***********//


// index page
var index = function (req, res, next) {
    
    var number = parseInt(Math.random() * 9000 + 1000);    
    var captchaCode = new Buffer(util.getCaptcha(number)).toString('base64');       
    req.session.capchaVal = number;
    res.render('index', { title: prop.indexTitle, captchaCode: captchaCode});
};

// contact form
var contact = function (req, res, next) {   
    if (req.session.capchaVal == req.body.captchaEntered) {
        //send email to us        
        var msg = util.emailTextContact(req.body.name, req.body.company, req.body.email, req.body.phone, req.body.message);
        util.sendEmail(prop.contactEmail, msg, prop.emailSubjectContact);
        
         //send mail to sender
        var msg = util.emailTextContactSender(req.body.name);
        util.sendEmail(req.body.email, msg, prop.emailSubjectContactSender);       
        

        
        //generate new captcha and render the index page
        var number = parseInt(Math.random() * 9000 + 1000);
        var captchaCode = new Buffer(util.getCaptcha(number)).toString('base64');
        req.session.capchaVal = number;
        
        //res.redirect('index?contactSuccessMessage#contact');
        res.render('index', { title: prop.indexTitle, captchaCode: captchaCode, contactFormMessage: prop.contactFormSuccess });

    } else {
        //generate new captcha and render the index page
        var number = parseInt(Math.random() * 9000 + 1000);
        var captchaCode = new Buffer(util.getCaptcha(number)).toString('base64');
        req.session.capchaVal = number;
        res.render('index', { title: prop.indexTitle, captchaCode: captchaCode, contactFormMessage: prop.captchaError });
    }

};

// home page
var home = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.user;
        if (user !== undefined) {
            user = user.toJSON();
        }
        
        var projListPromise = null;
        projListPromise = new Model.UserProjects().query({ where: { username: user.username } }).fetch();
        
        return projListPromise.then(function (collection) {
            if (collection) {
                var userProjectList = collection.toJSON();     // projects assigned to the user          
                var adminLink = '';
                var adminLinkText = '';
                if (user.role == 'admin') {
                    adminLink = prop.adminLink;
                    adminLinkText = prop.adminLinkText;
                }
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.header("Expires", 0);                
                res.render('home', { title: user.firstname + '\'' + 's' + ' ' + prop.homeTitle, user: user, adminLink: adminLink, adminLinkText: adminLinkText, userProjectList: userProjectList });
                
            
            } else { // no projects assigned to the user
                
                // check if user has admin rights and redirect
                var adminLink = '';
                var adminLinkText = '';
                if (user.role == 'admin') {
                    adminLink = prop.adminLink;
                    adminLinkText = prop.adminLinkText;
                }
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                res.header("Pragma", "no-cache");
                res.header("Expires", 0);
                res.render('home', { title: user.firstname + '\'' + 's' + ' ' + prop.homeTitle, user: user, adminLink: adminLink, adminLinkText: adminLinkText });
            }

        }).otherwise(function (err) {
            console.log(err.message);
        });
    }
};


// login
// GET
var login = function (req, res, next) {    
    if (req.isAuthenticated()) res.redirect('/home');
    res.render('login', { title: prop.loginTitle });
};


// login
// POST
var loginPost = function (req, res, next) {
    var loginErrorMessage = '';
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: 'login?errorMessage'
    }, function (err, user, info) {
        
        if (err) {
            return res.render('login', { title: prop.loginTitle, loginErrorMessage: err.message });
        }
        
        if (!user) {
            return res.render('login', { title: prop.loginTitle, loginErrorMessage: info.message });
        }
        return req.logIn(user, function (err) {
            if (err) {
                return res.render('login', { title: prop.loginTitle, loginErrorMessage: err.message });
            } else {
                if (req.body.rememberme) {
                    req.session.cookie.maxAge = prop.remembermeSessionTime;
                }
                return res.redirect('/home');
            }
        });
    })(req, res, next);
};




// sign out
var signOut = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    } else {
        req.logout();
        res.redirect('/');
    }
};

//skyspark sign out
var skySignOut = function (req, res, next) {
        res.clearCookie('fanws'); // clear cookie to avoid pressing back button  
        res.redirect('/home');
    
};

// project redirect to skyspark
var project = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {                           // skyspark project redirect
        var user = req.user;
        if (user !== undefined) {
            user = user.toJSON();
        }
        
        var projurl = req.params.id;
        var skySparkServer = prop.skySparkServer;
        var saltURI = "/auth/" + projurl + "/salt";
        var loginURI = "/auth/" + projurl + "/login";
        
        var username = user.username;
        var pwd = user.skypd;
        
        var saltPath = skySparkServer + saltURI + "?" + username;
        
        // with http module
        /*var http = require('http');    
        var req = http.get(saltPath, function (res) {
        res.setEncoding();
        res.on('data', function (chunk) {
            //console.log(chunk.length);
            //console.log(chunk);
            var str = chunk.toString();
            var result = str.split(/\r?\n/);
            var salt = result[0];
            var nonceStr = result[1];
            //res.destroy();
            
            var bytes = toBytes(username + ":" + salt);
            var passBytes = toBytes(password);
            var hmac = sha1(bytes, passBytes);
            var hmacStr = toBase64(hmac);
            
            var digestBytes = toBytes(hmacStr + ":" + nonceStr);
            var digestHash = sha1(digestBytes);
            var digestStr = toBase64(digestHash);
            setCookie(digestStr);
        });
    });*/

    // with request module
    var request = require('request');
        request(saltPath, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                
                // get salt and nonce
                var str = body.toString();
                var result = str.split(/\r?\n/);
                var salt = result[0];
                var nonce = result[1];
                
                // Encrypt
                var bytes = util.toBytes(username + ":" + salt);
                var passBytes = util.toBytes(pwd);
                var hmac = util.sha1(bytes, passBytes);
                var hmacStr = util.toBase64(hmac);
                var digestBytes = util.toBytes(hmacStr + ":" + nonce);
                var digestHash = util.sha1(digestBytes);
                var digestStr = util.toBase64(digestHash);
                
                // create key value pair
                var userData = {
                    username: username,
                    nonce: nonce,
                    digest: digestStr,
                    mobile: false,
                    password: pwd
                };
                
                // get the login cookie and redirect
                var http = require('http');
                http.post = require('http-post');
                http.post(skySparkServer + loginURI, userData, function (resp) {
                    var x = resp.headers["set-cookie"].toString();
                    var separators = ['=', ';', '\"', ' '];
                    var tokens = x.split(new RegExp(separators.join('|'), 'g'));
                    res.cookie('fanws', tokens[2]);                   
                    res.redirect('/proj/' + projurl);
                });
            }
        });
    }
};


// proxy skyspark
var skyspark = function (req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0); 
    skyproxy.web(req, res, { target: prop.skySparkServer });
};


// email password
// GET
var email = function (req, res, next) {
    if (req.isAuthenticated()) res.redirect('/home');
    res.render('email-pwd', { title: prop.forgotPwdTitle });
};

// email password
// POST
var emailPost = function (req, res, next) {
    
    var reqBody = req.body;
    var email = reqBody.email;
    var username = reqBody.username;
    var forgotPwdMessage = '';
    
    // generate password and hash it
    var randomPwd = util.randomString(10);
    var hash = bcrypt.hashSync(randomPwd);
    
    // blank username and password
    if (username == "" && email == "") {
        forgotPwdMessage = prop.blankUnameEmail;
        res.render('email-pwd', { title: prop.forgotPwdTitle, forgotPwdMessage : prop.blankUnameEmail });

    }
    // username and blank email
    if (username != "" && email == "") {
        //update password in DB
        new Model.User({ username: username })
        .fetch({ require: true })
        .then(function (model) {
            model.save({ password: hash }, { patch: true })
                .then(function () {
                var name = model.get('firstname');
                var msg = util.emailText(randomPwd, name);
                util.sendEmail(model.get('emailId'),msg, prop.emailSubjectPassword);
                res.render('login', { title: prop.loginTitle , loginErrorMessage : prop.newPasswordSent });
                 //res.redirect('/login');
            }).otherwise(function (err) {
                console.log('Save error');
                console.log(err.message);
                res.render('login', { title: prop.loginTitle });
               // res.redirect('/login');
            });
        }).otherwise(function (err) {
            console.log('Fetch error');
            console.log(err.message);
            res.render('email-pwd', { title: prop.forgotPwdTitle, forgotPwdMessage : prop.invalidUnamelMsg });
        //res.redirect('/login');
        });
 

    }
    //blank username and email
    if (username == "" && email != "") {
        // update password in DB 
        new Model.User({ emailId: email })
        .fetch({ require: true })
        .then(function (model) {
            model.save({ password: hash }, { patch: true })
                .then(function () {
                var name = model.get('firstname');
                var msg = util.emailText(randomPwd, name);
                util.sendEmail(model.get('emailId'), msg);
                res.render('login', { title: prop.loginTitle, loginErrorMessage : prop.newPasswordSent });
                 //res.redirect('/login');
            }).otherwise(function (err) {
                console.log('Save error');
                console.log(err.message);
                res.render('login', { title: prop.loginTitle});
               // res.redirect('/login');
            });
        }).otherwise(function (err) {
            console.log('Fetch error');
            console.log(err.message);
            res.render('email-pwd', { title: prop.forgotPwdTitle, forgotPwdMessage : prop.invalidEmailMsg });
        //res.redirect('/login');
        });

    }
    // username and email
    if (username != "" && email != "") {
        // update password in DB 
        new Model.User({ emailId: email, username : username})
        .fetch({ require: true })
        .then(function (model) {
            model.save({ password: hash }, { patch: true })
                .then(function () {
                var name = model.get('firstname');
                var msg = util.emailText(randomPwd, name);
                util.sendEmail(model.get('emailId'), msg);
                res.render('login', { title: prop.loginTitle, loginErrorMessage : prop.newPasswordSent });
                 //res.redirect('/login');
            }).otherwise(function (err) {
                console.log('Save error');
                console.log(err.message);
                res.render('login', { title: prop.loginTitle});
               // res.redirect('/login');
            });
        }).otherwise(function (err) {
            console.log('Fetch error');
            console.log(err.message);
            res.render('email-pwd', { title: prop.forgotPwdTitle, forgotPwdMessage : prop.usernameEmailMismatch });
        //res.redirect('/login');
        });

    }    
};




// admin page
//GET
/*
var admin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.user;
        if (user !== undefined) {
            user = user.toJSON();
        }
        
        if (user.role == 'admin') {
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);
            res.render('admin', { title: prop.adminTitle, user: user });
        } else {
            req.logout();
            res.render('login', { title: prop.loginTitle, loginErrorMessage: prop.adminErrMsg });
        }
    }
};

 */

// to test interactive admin
var admin = function (req, res, next) {
    //var assignUP = require("./assignUP");
   // var abc  = assignUP.dbAssignUserProject("test","Demo Project");
    //console.log(abc);


    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.user;
        if (user !== undefined) {
            user = user.toJSON();
        }
        
        var selectedUser = req.query.selectedUser;
        var selectedProject = req.query.selectedProject;
        
        if (user.role == 'admin') {
            var usersList = null;
            usersList = new Model.Users().fetch();
            
            return usersList.then(function (userCollection) {
                if (userCollection) {
                    //fetch users
                    var uList = userCollection.toJSON();
                    var projectList = null;
                    projectList = new Model.Projects().fetch();
                    
                    projectList.then(function (projectCollection) {
                        if (projectCollection) {
                            //fetch projects        
                            var pList = projectCollection.toJSON();
                            var upList = null;
                            var puList = null
                            /////////////////
                            
                            if (selectedUser != null) { // if some user is selected in admin
                                var userProjectList = null;
                                userProjectList = new Model.UserProjects().query({ where: { username: selectedUser } }).fetch();
                                
                                return userProjectList.then(function (upCollection) {
                                    if (upCollection) {
                                        // fetch user project
                                        upList = upCollection.toJSON();     // projects assigned to the user          
                                        //////////////////
                                        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                                        res.header("Pragma", "no-cache");
                                        res.header("Expires", 0);
                                        res.render('admin2', { title: prop.adminTitle, user: user, uList: uList, pList: pList, upList: upList, puList: puList, selectedUser: selectedUser, selectedProject: selectedProject });
            
                                    } else { 
                                    // no projects assigned to the user                                 
                                    }

                                }).otherwise(function (err) {
                                    //user project fetch error
                                    console.log(err.message);
                                });

                            } else if (selectedProject != null) {
                                var projectUserList = null;
                                projectUserList = new Model.UserProjects().query({ where: { projectname: selectedProject } }).fetch();
                                
                                return projectUserList.then(function (puCollection) {
                                    if (puCollection) {
                                        // fetch project users
                                        puList = puCollection.toJSON();     // projects assigned to the user          
                                        //////////////////
                                        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                                        res.header("Pragma", "no-cache");
                                        res.header("Expires", 0);
                                        res.render('admin2', { title: prop.adminTitle, user: user, uList: uList, pList: pList, upList: upList, puList: puList, selectedUser: selectedUser, selectedProject: selectedProject });
            
                                    } else { 
                                    // no users assigned to the project                                 
                                    }

                                }).otherwise(function (err) {
                                    //user project fetch error
                                    console.log(err.message);
                                });

                            } else {
                                //////////////////
                                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                                res.header("Pragma", "no-cache");
                                res.header("Expires", 0);
                                res.render('admin2', { title: prop.adminTitle, user: user, uList: uList, pList: pList, upList: upList, puList: puList, selectedUser: selectedUser, selectedProject: selectedProject });
                            }       
                            
                        }
                        else {
                           //no projects obtained
                        }
                    }).otherwise(function (err) {
                        //project fetch error
                        console.log(err.message);
                    });
                }
                else {
                //no users obtained
                }
            }).otherwise(function (err) {
                //user fetch error
                console.log(err.message);
            });            
        } else {
            req.logout();
            res.render('login', { title: prop.loginTitle, loginErrorMessage: prop.adminErrMsg });
        }
    }
};


// to test interactive admin


// for adding user first time use this and comment above route
/*
var admin = function (req, res, next) {  
        
            res.render('admin', { title: 'Admin Console'});        
};
*/

// admin add user
//POST
var addUser = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.body;
        var usernamePromise = null;
        usernamePromise = new Model.User({ emailId: user.emailId }).fetch();
        
        return usernamePromise.then(function (model) {
            if (model) {
                addUserMessage = prop.addUserEmailErrMsg;
                res.redirect('admin?addUserMessage#user');
            
            } else {
                var usernamePromise1 = null;
                usernamePromise1 = new Model.User({ username: user.username }).fetch();
                
                usernamePromise1.then(function (model) {
                    if (model) {
                        addUserMessage = prop.addUserUnameErrMsg;
                        res.redirect('admin?addUserMessage#user');
                  
                    } else {
                        //MORE VALIDATION for adding user if needed
                        var password = user.password;
                        var hash = bcrypt.hashSync(password);
                        
                        var signUpUser = new Model.User({ username: user.username, password: hash, firstname: user.firstname, lastname: user.lastname, emailId: user.emailId, address1: user.address1, address2: user.address2, skypd: user.skypd, role: user.role });
                        signUpUser.save().then(function (model) {
                            addUserMessage = prop.addUserScccessMsg;
                            res.redirect('admin?addUserMessage#user');
                        }).otherwise(function (err) {
                            console.log(err.message);
                        });
                    }
                }).otherwise(function (err) {
                    console.log(err.message);
                });

            }
        }).otherwise(function (err) {
            console.log(err.message);
        });
    }
};

// admin remove user
//POST
var removeUser = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.body;
        var userPromise = null;
        userPromise = new Model.User({ username: user.username }).fetch();
        
        return userPromise.then(function (model) {
            if (model) {
                var userRemove = model;
                userRemove.destroy().then(function () {
                    removeUserMessage = prop.removeUserSuccessMsg;
                    res.redirect('admin?removeUserMessage#user');
                }).otherwise(function (err) {
                    console.log(err.message);
                });
            } else {
                removeUserMessage = prop.removeUserErrMsg;
                res.redirect('admin?removeUserMessage#user');
            }
        }).otherwise(function (err) {
            console.log(err.message);
        });
    }
};

// admin add project
//POST

var addProject = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var proj = req.body;
        var projPromise = null;
        projPromise = new Model.Project({ projectname: proj.projectname }).fetch();
        
        return projPromise.then(function (model) {
            
            if (model) {
                addProjMessage = prop.addProjNameErrMsg;
                res.redirect('admin?addProjMessage#project');
            } else {
                var projPromise1 = null;
                projPromise1 = new Model.Project({ projecturl: proj.projecturl }).fetch();
                
                projPromise1.then(function (model) {
                    if (model) {
                        addProjMessage = prop.addProjURLErrMsg;
                        res.redirect('admin?addProjMessage#project');
                    } else {
                        //MORE VALIDATION for adding project if needed
                        
                        var projAdd = new Model.Project({ projectname: proj.projectname, projecturl: proj.projecturl, projectdesc: proj.projectdesc });
                        projAdd.save().then(function (model) {
                            addProjMessage = prop.addProjSuccessMsg;
                            res.redirect('admin?addProjMessage#project');
                        }).otherwise(function (err) {
                            console.log(err.message);
                        });
                    }
                }).otherwise(function (err) {
                    console.log(err.message);
                });

            }
        }).otherwise(function (err) {
            console.log(err.message);
        });
    }
};

// admin remove project
//POST

var removeProject = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var proj = req.body;
        var projPromise = null;
        projPromise = new Model.Project({ projectname: proj.projectname }).fetch();
        
        return projPromise.then(function (model) {
            if (model) {
                var projRemove = model;
                projRemove.destroy().then(function () {
                    removeProjMessage = prop.removeProjSuccessMsg;
                    res.redirect('admin?removeProjMessage#project');
                }).otherwise(function (err) {
                    console.log(err.message);
                });
            } else {
                removeProjMessage = prop.removeProjErrMsg;
                res.redirect('admin?removeProjMessage#project');
            }
        }).otherwise(function (err) {
            console.log(err.message);
        });
        
    }
    
};


// admin assign user project
//POST

var assignUserProject = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var bod = req.body;
        var upPromise = null;
        upPromise = new Model.User({ username: bod.username }).fetch();
        
        return upPromise.then(function (modelU) {
            if (modelU) {
                var upPromise1 = null;
                upPromise1 = new Model.Project({ projectname: bod.projectname }).fetch();
                
                upPromise1.then(function (modelP) {
                    if (modelP) {
                        var upPromise2 = null;
                        upPromise2 = new Model.UserProject({ username : bod.username, projectname: bod.projectname }).fetch();
                        upPromise2.then(function (modelUP) {
                            if (modelUP) {
                                assignUserProjMessage = prop.upAssignDuplicateErrMsg;
                                res.redirect('admin?assignUserProjMessage#user-project');
                   
                            } else {
                                var assignUP = new Model.UserProject({ username: bod.username, projectname: bod.projectname, projecturl: modelP.get('projecturl') });
                                assignUP.save().then(function (model) {
                                    assignUserProjMessage = prop.upAssignSuccessMsg;
                                    res.redirect('admin?assignUserProjMessage#user-project');
                                }).otherwise(function (err) {
                                    console.log(err.message);
                                });
                            }
                        }).otherwise(function (err) {
                            console.log(err.message);
                        });
                   
                    } else {
                        assignUserProjMessage = prop.upAssignProjErrMsg;
                        res.redirect('admin?assignUserProjMessage#user-project');
                    }
                }).otherwise(function (err) {
                    console.log(err.message);
                });
            
            } else {
                assignUserProjMessage = prop.upAssignUserErrMsg;
                res.redirect('admin?assignUserProjMessage#user-project');

            }
        }).otherwise(function (err) {
            console.log(err.message);
        });
        
    }
    
};


// admin unassign user project
//POST

var unassignUserProject = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var up = req.body;
        var upPromise = null;
        upPromise = new Model.UserProject({ username: up.username, projectname: up.projectname }).fetch();
        
        return upPromise.then(function (model) {
            if (model) {
                var upRemove = model;
                upRemove.destroy().then(function () {
                    unassignUserProjMessage = prop.upUnAssignSuccessMsg;
                    res.redirect('admin?unassignUserProjMessage#user-project');
                }).otherwise(function (err) {
                    console.log(err.message);
                });
            } else {
                unassignUserProjMessage = prop.upUnAssignErrMsg;
                res.redirect('admin?unassignUserProjMessage#user-project');
            }
        }).otherwise(function (err) {
            console.log(err.message);
        });
        
    }
    
};


// Change Password
// GET


var changePwd = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.user;
        if (user !== undefined) {
            user = user.toJSON();
        }
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        res.render('change-pwd', { title: prop.changePwdTitle, user: user });
    }
};


// login
// POST

var changePwdPost = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        var user = req.user;
        var pwds = req.body;
        var changePwdMessage = '';
        if (user !== undefined) {
            user = user.toJSON();
        }
        var pwdPromise = null;
        pwdPromise = new Model.User({ emailId: user.emailId }).fetch();
        
        return pwdPromise.then(function (model) {
            if (model) {
                //var hashold = bcrypt.hashSync(pwds.oldpassword);
                if (!bcrypt.compareSync(pwds.oldpassword, model.get('password'))) {
                    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                    res.header("Pragma", "no-cache");
                    res.header("Expires", 0);
                    return res.render('change-pwd', { title: prop.changePwdTitle, changePwdMessage: prop.changePwdWrongPwdMsg });
                } else if (pwds.newpassword != pwds.newpasswordre) {
                    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                    res.header("Pragma", "no-cache");
                    res.header("Expires", 0);
                    return res.render('change-pwd', { title: prop.changePwdTitle, changePwdMessage: prop.changePwdMismatchMsg });
                } else {
                    var hashnew = bcrypt.hashSync(pwds.newpassword);
                    model.save({ password: hashnew }, { patch: true })
                .then(function () {
                        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                        res.header("Pragma", "no-cache");
                        res.header("Expires", 0);
                        return res.render('change-pwd', { title: prop.changePwdTitle, changePwdMessage: prop.changePwdSuccessMsg });
                 //res.redirect('/login');
                    })
                .otherwise(function (err) {
                        console.log('Save error');
                        console.log(err.message);
                        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                        res.header("Pragma", "no-cache");
                        res.header("Expires", 0);
                        return res.render('change-pwd', { title: prop.changePwdTitle, changePwdMessage: prop.unexpectedError });
                    });
                }
            }
        }).otherwise(function (err) {
            console.log(err.message);
        });
    }
    
};



// 404 not found
var notFound404 = function (req, res, next) {
    res.status(404);
    res.render('404', { title: prop.pnfTitle });
};


// maintenance
var maintenance = function (req, res, next) {
    res.render('maintenance', { title: prop.maintenanceTitle });
};



// export functions
/**************************************/

// index
module.exports.index = index;

// contact
module.exports.contact = contact;

// home
module.exports.home = home;

// login
// GET
module.exports.login = login;
// POST
module.exports.loginPost = loginPost;

// sign out
module.exports.signOut = signOut;

// skyspark sign out
module.exports.skySignOut = skySignOut;

// skyspark project
module.exports.project = project;

// proxy for skyspark
module.exports.skyspark = skyspark;

// email password
// GET
module.exports.email = email;
// POST
module.exports.emailPost = emailPost;

// admin page
// GET
module.exports.admin = admin;

// add user
// POST
module.exports.addUser = addUser;
// add user
// POST
module.exports.removeUser = removeUser;

// add project
// POST
module.exports.addProject = addProject;
// add project
// POST
module.exports.removeProject = removeProject;

// assign user project
// POST
module.exports.assignUserProject = assignUserProject;
// assign user project
// POST
module.exports.unassignUserProject = unassignUserProject;

// change password
// GET
module.exports.changePwd = changePwd;
// POST
module.exports.changePwdPost = changePwdPost;


// 404 not found
module.exports.notFound404 = notFound404;

// maintenance
module.exports.maintenance = maintenance;