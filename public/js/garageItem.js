var superUtil = new SuperUtil();
var token = localStorage.getItem('token');
var userId = localStorage.getItem('userId');
//
document.addEventListener("DOMContentLoaded", function(){
    // begin
    superUtil.init(document);
    // Build Navigation bar controls
    var navigationLinks = [];

    superUtil.initNavigation('navigation', navigationLinks);

    //Logo home page
    superUtil.grabElement('navLogo').addEventListener('click', function(data) {
        //console.log('data: ', data);
        window.location = '/';
    });

    //Check to see who it is
    checkUser(userId);

});

function checkUser(user){
    var createdByUserId = document.querySelector('.createdBy').innerHTML;
    if(token != null && user == createdByUserId) {
        document.querySelector('.navMessages').innerHTML+= "<span>This is your public view.</span>";
    } else {
        //console.log('do not show valid user message.')
    }
}