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
    appTimer();

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
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
        console.log('authenticated: ', status, data);
        if(status == 200 && data.authenticated == true){
			//console.log('go to profile');
			window.location = '/profile';
			//localStorage.removeItem('token');
		}
    });
};

function appTimer() {
    var minuteCount = 1;
    var timeMinuteSet = 10;
    var appTimer = setInterval(function(){
        
        minuteCount ++;
        console.log('interval ', minuteCount);
        if(minuteCount == timeMinuteSet) {
            minuteCount = 1;
            console.log('interval ', minuteCount);
            superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
                if(status != 200 && data.authenticated != true){
                    //console.log('go to profile');
                    window.location = '/logout';
                    //localStorage.removeItem('token');
                }
            });
        }
    },(1000* 60));

    console.log('later clear interval: ', appTimer);
}