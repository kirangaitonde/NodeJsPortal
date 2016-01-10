var Model = require('./model1');

var dbAssignUserProject = function (username, projectname) {
    console.log("dbAssignUserProject called: ");
    var ret = null;
    var upPromise1 = null;
    upPromise1 = new Model.Project({ projectname: projectname }).fetch();
    upPromise1.then(function (modelP) {
        var upPromise2 = null;
        upPromise2 = new Model.UserProject({ username : username, projectname: projectname }).fetch();
        upPromise2.then(function (modelUP) {
            if (modelUP) {
                ret = 1;
                console.log(ret);
            } else {
                var assignUP = new Model.UserProject({ username: username, projectname: projectname, projecturl: modelP.get('projecturl') });
                assignUP.save().then(function (model) {
                    ret = 0;
                    console.log(ret);
                }).otherwise(function (err) {
                    // error saving user-project
                    console.log(err.message);
                });
            }
        }).otherwise(function (err) {
            //error fetching user-project
            console.log(err.message);
        });
               
    }).otherwise(function (err) {
        // error fetching project
        console.log(err.message);
    });
    
    return ret;
};


