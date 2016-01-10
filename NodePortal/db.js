//@author Kiran Gaitonde

// libraries
var Bookshelf = require('bookshelf');
var prop = require('./properties');


var config = {
   host: prop.dbHost,  
   user: prop.dbUser, 
   password: prop.dbPassword, 
   database: prop.dbName,
   charset:  prop.dbCharset
};

var DB = Bookshelf.initialize({
   client: prop.dbClient, 
   connection: config
}); 

module.exports.DB = DB;