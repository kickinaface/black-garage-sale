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
        // {
        //     title: 'CONTACT',
        //     link: '/contact'
        // },
        // {
        //     title: 'SERVICES',
        //     link:'/services'
        // }
    ];

    superUtil.initNavigation('navigation', navigationLinks);

    // grab element
   // console.log(superUtil.grabElement('blueBox').querySelector('p'));

    //Logo home page
    superUtil.grabElement('navLogo').addEventListener('click', function(data) {
        //console.log('data: ', data);
        window.location = '/';
    });

    getSecuredRequest();
    // start app timer 
   // appTimer();

});

function getData(){
    // grab JSON
    superUtil.grabJSON('api/test', function(status, data) {
        console.log(status, data);
    });
};

function getSecuredRequest() {    
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
        console.log('authenticated: ', status, data);
        if(status == 200 && data.authenticated == true){
			//console.log('go to profile');
			window.location = '/profile';
			//localStorage.removeItem('token');
		}
    });
};