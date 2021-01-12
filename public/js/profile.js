var superUtil = new SuperUtil();
var token = localStorage.getItem('token');
var userId = localStorage.getItem('userId');
document.addEventListener("DOMContentLoaded", function(){
    // begin
    superUtil.init(document);
    // Build Navigation bar controls
    var navigationLinks = [
        {
            title: 'PROFILE',
            link: '/profile'
        },
        {
            title: 'MESSAGES',
            link: '/messages',
        },
        {
            title: 'GARAGE',
            link: '/garage'
        },
        {
            title: 'SEARCH',
            link: '/search'
        },
        {
            title: 'LOGOUT',
            link: '/logout'
        }
    ];

    superUtil.initNavigation('navigation', navigationLinks);

    //Logo home page
    superUtil.grabElement('navLogo').addEventListener('click', function(data) {
        //console.log('data: ', data);
        window.location = '/';
    });

    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
        console.log('authenticated: ', status, data);
        if(status != 200 && data.authenticated != true){
            console.log('go to login');
            window.location = '/login';
        }
    });
    loadAvatarPhoto();
});

// change modal logic to be inside of superUtil later
function openModal(modalType) {
    console.log('modalType: ', modalType);
    if(modalType == 'avatar'){
        document.querySelector('.changeAvatarModal').style.display = 'block';
    } else if (modalType == 'changeName') {
        document.querySelector('.changeName').style.display = 'block';
    } else if(modalType == 'changePassword') {
        document.querySelector('.changePassword').style.display = 'block';
    } else if(modalType == 'garage') {
        window.location = '/garage';
    } else if(modalType == 'messages') {
        window.location = '/messages';
    } else if(modalType == 'search') {
        window.location = '/search';
    } else if(modalType == 'removeUser') {
        document.querySelector('.removeUser').style.display = 'block';
    } else if(modalType == 'removeAdmin') {
        document.querySelector('.removeAdmin').style.display = 'block';
    } else if(modalType == 'getAdmins') {
        document.querySelector('.getAdmins').style.display = 'block';
    } else if(modalType == 'createAdmin') {
        document.querySelector('.createAdmin').style.display = 'block';
    }
}

function closeModal(sClass) {
    document.querySelector(sClass).style.display = 'none';
}
function appTimer() {
    setInterval(function(){
        
        superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
            if(status == 200 && data.authenticated == true){
                // User is logged in and authenticated
                console.log('valid token');
            } else {
                //console.log('go to profile');
                window.location = '/logout';
                //localStorage.removeItem('token');
            }

        });
    },(1000* 60));

    //console.log('later clear interval: ', appTimer);
};
appTimer();

function loadAvatarPhoto(){
    var avatarUploadUserToken = document.querySelector('#avatarUploadUserToken');
    avatarUploadUserToken.value = token;
    
    var avatarPhoto = document.querySelector('.userImageAvatar');

    if(userId != 'undefined'){
        var imageUrl = ('/avatar/'+userId+'/avatarImage.jpg');
        
        urlExists(imageUrl, function (exists) {
            if(!exists) {
                // Do nothing continue loading default photo
            } else {
                avatarPhoto.src = imageUrl;
            }
        });
    }
};

function urlExists(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        callback(xhr.status < 400);
      }
    };
    xhr.open('HEAD', url);
    xhr.send();
}