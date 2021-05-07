var superUtil = new SuperUtil();
var token = localStorage.getItem('token');
var userId = localStorage.getItem('userId');
var createdByUserId;
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
    setItemBaseBoard();
    loadAvatarPhoto();
});

function checkUser(user){
    createdByUserId = document.querySelector('.createdBy').innerHTML;
    if(token != null && user == createdByUserId) {
        document.querySelector('.navMessages').innerHTML+= "<span>This is your public view.</span>";
    } else {
        //console.log('do not show valid user message.')
    }
};

function setItemBaseBoard(){
    var isSoldValue = document.querySelector('.isSold span').innerHTML;
    var isAvailableValue = document.querySelector('.isAvailable span').innerHTML;
    var buyItemButton = document.querySelector('.buyItemButton');
    //
    if(isSoldValue == 'false' && isAvailableValue=='true'){
       buyItemButton.style.display = 'block';
    } 

    if(isSoldValue == 'true'){
        document.querySelector('.itemErrors').innerHTML +='<b style="color:red;">SOLD OUT<b><br/>';
    } 

    if(isAvailableValue == 'false'){
        document.querySelector('.itemErrors').innerHTML +='<b style="color:red;">OUT OF STOCK<b>';
    }
};

function gotoUserGarage(garageID){
    window.location = ('/garage/user/'+garageID);
}

function loadAvatarPhoto(){
    var avatarPhoto = document.querySelector('.ownerAvatar');

    if(createdByUserId != 'undefined'){
        var imageUrl = ('/avatar/'+createdByUserId+'/avatarImage.jpg');
        
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
};