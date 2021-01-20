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
    appTimer();
    getFirstLastName();
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

function removeBasicUser() {
    var removeBasicUserText = document.querySelector('.removeBasicUser').value;
    var errorMessages = document.querySelector('.errorMessages p');
    var responseMessages = document.querySelector('.responseMessages p');

    superUtil.authPostRequest(null, ('api/users/'+removeBasicUserText), function(status, res) {
        if(status != 200){
            //console.log('message: ', res.message);
            errorMessages.innerHTML = res.message;
            responseMessages.innerHTML = '';
        } else if(status == 200) {
            
            if(res.status == undefined && res.message == undefined) {
                console.log('error message,');
                errorMessages.innerHTML = 'There is no user by that ID';
                responseMessages.innerHTML = '';
            } else {
                responseMessages.innerHTML = res.message;
                errorMessages.innerHTML = '';
            }
        }
    },'DELETE');
}


// Admin Modal Methods
function removeAdminUser(){
    var removeAdminUserText = document.querySelector('.removeAdminUser').value;
    var errorMessages = document.querySelector('.removeAdmin .errorMessages p');
    var responseMessages = document.querySelector('.removeAdmin .responseMessages p');

    superUtil.authPostRequest(null, ('api/admin/'+removeAdminUserText), function(status, res) {
        // console.log(status, res.message);
        // console.log(res);
        if(status != 200){
            errorMessages.innerHTML = res.message;
            responseMessages.innerHTML = '';
        } else if(status == 200) {
            
            if(res.status == undefined && res.message == undefined) {
                console.log('error message,');
                errorMessages.innerHTML = 'There is no user by that ID';
                responseMessages.innerHTML = '';
            } else {
                responseMessages.innerHTML = res.message;
                errorMessages.innerHTML = '';
            }
        }
    },'DELETE');
}

function getAdmins(){
    var getAdminsText = document.querySelector('.getAdminUsers').value;
    var errorMessages = document.querySelector('.getAdmins .errorMessages p');
    var responseMessages = document.querySelector('.getAdmins .responseMessages p');

    superUtil.getAuthenticatedRequest(token, ('api/admin?username='+getAdminsText), function(status, data){
        // console.log('status: ', status);
        // console.log('data: ', data);
        if(status != 200){
            errorMessages.innerHTML = data.message;
            responseMessages.innerHTML = '';
        } else {
            errorMessages.innerHTML = '';
            responseMessages.innerHTML = '';
            for(var a = 0; a<= data.length-1; a++){
                //responseMessages.innerHTML = data;
                responseMessages.innerHTML += "<div><p><b>Email: </b>"+data[a].username+"</p><p><b>Role: </b>"+data[a].role+"</p></div><br/>";
            }
            
        }
    });
}

function createNewAdminUser() {
    var adminEmail = superUtil.grabElement('adminEmail');
    var adminPassword = superUtil.grabElement('adminPassword');
    var errorMessages = document.querySelector('.createAdmin .errorMessages p');
    var responseMessages = document.querySelector('.createAdmin .responseMessages p');

    if(adminEmail == '' || adminPassword == ''){
        errorMessages.innerHTML = 'You must fill in all fields';
        responseMessages.innerHTML = '';
    } else {
        var postData = {
			username: adminEmail.value,
			password: adminPassword.value
        };
        //Create a new admin POST request
        superUtil.authPostRequest(postData, 'api/admin', function (status, response){
            console.log(status, response.message);
            //message = response;
            //console.log(responsMessages);
            
            if(status != 200){
                errorMessages.innerHTML = response.message;
                responseMessages.innerHTML = '';
            } else if(status == 200) {
                responseMessages.innerHTML = response.message;
                errorMessages.innerHTML = '';
            }
        }, 'POST');
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
                //logout
                localStorage.removeItem('token');
                window.location = '/logout';
            }

        });
    },(1000* 60));

    //console.log('later clear interval: ', appTimer);
};

//Basic user modal methods
function updateName(){
    var adminEmail = superUtil.grabElement('adminEmail');
    var adminPassword = superUtil.grabElement('adminPassword');
    var errorMessages = document.querySelector('.createAdmin .errorMessages p');
    var responseMessages = document.querySelector('.createAdmin .responseMessages p');
};

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

function getFirstLastName() {
    var displaynameText = document.querySelector('.displayname');
    superUtil.getAuthenticatedRequest(token,'api/displayName/'+(userId), function (status, data){
        if(status == 200) {
            displaynameText.innerHTML = (data.firstName + ' ' + data.lastName);
        } else {
            console.log(status, data);
        }
    });
}

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