var superUtil = new SuperUtil();
		
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

});

function getData(){
    // grab JSON
    superUtil.grabJSON('api/test', function(status, data) {
        console.log(status, data);
    });
};

function sendData(){
    // put JSON
    var postData = {
        name:'Christopher W Carter Jr',
        address: '4499 Wrangell Place',
        city: 'Columbus',
        state: 'Ohio',
        zip: '43230',
        status: 'single',
        email: 'kickinaface@gmail.com'
    };

    superUtil.sendJSON(postData, 'api/test', function (status, response){
        console.log(status, response);
    });
};

function getSecuredRequest() {
    var token = 'get from local storage';
    
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
        console.log('authenticated: ', status, data);
        if(status == 200 && data.authenticated == true){
			//console.log('go to profile');
			window.location = '/profile';
			//localStorage.removeItem('token');
		}
    });
}