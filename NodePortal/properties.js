//@author Kiran Gaitonde


// app port

var appPort = 3000;

// site maintenance
var maintenanceStat = false;

// Sky Spark Server
var skySparkServer = 'http://localhost';

//contatc form
var contactEmail = 'kiran.gaitonde@bradyservices.com';
var emailSubjectContact = 'New message from portal contact form';
var emailSubjectContactSender = 'Thank you for contacting Brady Intelligent Services';

// DB details
var dbClient = 'mysql';
var dbHost = 'localhost';
//var dbHost = '10.1.0.221';

var dbUser = 'root';
var dbPassword = '';
var dbName = 'portalDB';
var dbCharset = 'utf8';

var dbUserTable = 'users';
var dbUserTableId = 'userId';
var dbProjectTable = 'projects';
var dbProjectTableId = 'projectId';
var dbUserProjTable = 'userproject';
var dbUserProjTableId = 'upId';


//email forgot password details old one
/*var host = '52.2.247.109';
var emailAddress = 'rikkitikkitavi@bis.bradyservices.com';        
var emailPassword = 'brady1915';
var port = 25;
var ssl = false;*/
var randomPwdChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

//gmail account
var emailService = 'gmail';
var emailAddress = 'bis.bradyservices@gmail.com';
var emailPassword = 'Brady1915';
var emailSubjectPassword = 'BradyIntelligent Services : New password';


// Admin link details

var adminLink = 'admin';
var adminLinkText = 'Admin Console';

//session
var sessionSecret = 'all is well';

// session time details
var normalSessionTime = 120000; // 2 minutes
var remembermeSessionTime = 60 * 60000; // 1 hour



// page titles
var indexTitle = 'Brady Intelligent Services';
var homeTitle = 'Home';
var loginTitle = 'Login';
var forgotPwdTitle = 'Forgot Password';
var adminTitle = 'Admin Console';
var pnfTitle = 'Page not Found';
var changePwdTitle = 'Change Password';
var maintenanceTitle = 'Site Under Maintenance';


//Success messages
var addUserScccessMsg = 'User added successfully';
var removeUserSuccessMsg = 'User removed successfully';
var addProjSuccessMsg = 'Project added successfully';
var removeProjSuccessMsg = 'Project removed successfully';
var upAssignSuccessMsg = 'Project assigned to user successfully';
var upUnAssignSuccessMsg = 'Project un assigned successfully';
var changePwdSuccessMsg = 'Password changed sucessfully';
var contactFormSuccess = 'Thank yor for contacting us. We will get back to you soon!';
var newPasswordSent = 'New Password sent to registered email. Please use that to login!';


//error messages
var unexpectedError = 'Unexpected Error';
var invalidUserMsg = 'Invalid Username or Password';
var invalidEmailMsg = 'Email ID not registerd';
var invalidUnamelMsg = 'Username not found';
var usernameEmailMismatch = 'Username and Email-Id did not match';
var blankUnameEmail = 'Enter either Username or Email Id or both';
var adminErrMsg = 'You do not have admin rights!';
var addUserEmailErrMsg = 'Email Id already exists';
var addUserUnameErrMsg = 'Username already exists';
var removeUserErrMsg = 'Username does not exists';
var addProjNameErrMsg = 'Project name already exists';
var addProjURLErrMsg = 'Project URL already exists';
var removeProjErrMsg = 'Project name does not exists';
var changePwdWrongPwdMsg = 'Old password entered incorrectly';
var changePwdMismatchMsg = 'New passwords entered did not match';
var upAssignUserErrMsg = 'Username not found';
var upAssignProjErrMsg = 'Project name not found';
var upUnAssignErrMsg = 'Project not assigned to the user';
var upAssignDuplicateErrMsg = 'Project already assigned to the user';
var captchaError = 'Captcha entered is not correct. Try again!!';

//**********export properties*************

module.exports = {
    
    //app port
    appPort : appPort,
    
    // maintenance stat
    maintenanceStat: maintenanceStat,
    
    // skysparkserver
    skySparkServer : skySparkServer,
    
    //contatc form
    contactEmail: contactEmail,
    emailSubjectContact: emailSubjectContact,
    emailSubjectContactSender: emailSubjectContactSender,
    
    // DB details
    dbClient: dbClient,
    dbHost: dbHost,
    dbUser: dbUser,
    dbPassword: dbPassword,
    dbName: dbName,
    dbCharset: dbCharset,
    //
    dbUserTable: dbUserTable,
    dbUserTableId: dbUserTableId,
    dbProjectTable: dbProjectTable,
    dbProjectTableId: dbProjectTableId,
    dbUserProjTable: dbUserProjTable,
    dbUserProjTableId: dbUserProjTableId,
    
    // email server details
    /* host : host,
    emailAddress : emailAddress,
    emailPassword : emailPassword,    
    port : port,
    ssl : ssl, */
    randomPwdChars : randomPwdChars,
    
    //gmail account
    emailService: emailService,
    emailAddress: emailAddress,
    emailPassword: emailPassword,
    emailSubjectPassword : emailSubjectPassword,
    
    
    // admin link details
    adminLink : adminLink,
    adminLinkText : adminLinkText,   
    
    //session sec
    sessionSecret: sessionSecret,
    
    // session time details
    normalSessionTime : normalSessionTime,
    remembermeSessionTime : remembermeSessionTime,
    
    //page titles
    indexTitle : indexTitle,
    homeTitle : homeTitle,
    loginTitle : loginTitle,
    forgotPwdTitle : forgotPwdTitle,
    adminTitle : adminTitle, 
    pnfTitle: pnfTitle,
    changePwdTitle: changePwdTitle,
    maintenanceTitle: maintenanceTitle,
    
    //success messages
    addUserScccessMsg : addUserScccessMsg,
    removeUserSuccessMsg: removeUserSuccessMsg,
    addProjSuccessMsg : addProjSuccessMsg,
    removeProjSuccessMsg: removeProjSuccessMsg,
    upAssignSuccessMsg: upAssignSuccessMsg,
    upUnAssignSuccessMsg: upUnAssignSuccessMsg,
    changePwdSuccessMsg : changePwdSuccessMsg,
    contactFormSuccess: contactFormSuccess,
    newPasswordSent: newPasswordSent,
    
    
    
    //error messages
    unexpectedError: unexpectedError,
    invalidUserMsg: invalidUserMsg,
    invalidEmailMsg: invalidEmailMsg,
    invalidUnamelMsg: invalidUnamelMsg,
    usernameEmailMismatch: usernameEmailMismatch,
    blankUnameEmail: blankUnameEmail,
    adminErrMsg: adminErrMsg,    
    addUserEmailErrMsg : addUserEmailErrMsg,
    addUserUnameErrMsg : addUserUnameErrMsg,  
    removeUserErrMsg  : removeUserErrMsg,
    addProjNameErrMsg : addProjNameErrMsg,
    addProjURLErrMsg : addProjURLErrMsg,
    removeProjErrMsg : removeProjErrMsg,
    changePwdWrongPwdMsg: changePwdWrongPwdMsg,
    changePwdMismatchMsg : changePwdMismatchMsg,
    upAssignUserErrMsg: upAssignUserErrMsg,
    upAssignProjErrMsg: upAssignProjErrMsg,
    upUnAssignErrMsg : upUnAssignErrMsg,
    upAssignDuplicateErrMsg: upAssignDuplicateErrMsg,
    captchaError: captchaError


};