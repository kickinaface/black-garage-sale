var superUtil = new SuperUtil();
var token = localStorage.getItem('token');	
document.addEventListener("DOMContentLoaded", function(){
    // begin
    superUtil.init(document);
    // Build Navigation bar controls
    var navigationLinks = [
        {
            title: 'HOME',
            link:'/'
        },
        {
            title: 'LOGIN',
            link: '/login'
        },
        {
            title:'REGISTER',
            link: '/register'
        }
    ];

    superUtil.initNavigation('navigation', navigationLinks);

    //Logo home page
    superUtil.grabElement('navLogo').addEventListener('click', function(data) {
        //console.log('data: ', data);
        window.location = '/';
    });

    // getSecuredRequest();
    // start app timer 
   // appTimer();

   getUsersGarageById();

});

function getUsersGarageById(){
    var path = window.location.pathname.split('/');
    var garageUserId = path[3];
    //
    superUtil.grabJSON(('/api/garage/items/user/'+garageUserId), function (status, data) {
        //console.log(status);
        if (data.length == 0){
            console.log('throw message about nothing here');
        } else {
                console.log('handle data for users garage.');
            console.log(data);
        }
  
    });
}