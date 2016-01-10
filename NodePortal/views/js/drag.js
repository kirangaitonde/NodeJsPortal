//assigning project to user
dragula([document.getElementById('projectList'), document.getElementById('userProjectList')], 
{
    copy: function (el, source) {
        console.log("copy called: ");
        return source === projectList
       
    },
    accepts: function (el, target) {
        console.log("Accepts called: ");
        return target !== projectList
    }
}
).on('drop', function (el) {
    console.log("drop called: ");
    el.className += ' ex-moved';
   // el.textContent += $("#selectedUser").html();
    //el.textContent += $("#selectedUser");
    var abc = dbAssignUserProject("kiran", "Demo Project");
    //assignUP.dbAssignUserProject("a", "b");
    //var cde;
    //if (dbAssignUserProject(el.textContent, $("#selectedUser").html())) {
    //    el.remove();
   // }
   
});

//assigning user to project
dragula([document.getElementById('userList'), document.getElementById('projectUserList')],
{
    copy: function (el, source) {
        return source === userList
    },
    accepts: function (el, target) {
        return target !== userList
    }
}
);