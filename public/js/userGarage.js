var superUtil = new SuperUtil();
var token = localStorage.getItem('token');	
document.addEventListener("DOMContentLoaded", function(){
    superUtil.init(document);
    // Build Navigation bar controls
    var navigationLinks = [];
    var path = location.pathname;
    var userId = path.split('user/')[1];

    superUtil.initNavigation('navigation', navigationLinks);

    //Logo home page
    superUtil.grabElement('navLogo').addEventListener('click', function(data) {
        //console.log('data: ', data);
        window.location = '/';
    });
    

    getUsersGarageById();
    loadAvatarPhoto(userId);
    getFirstLastName(userId);
});

function loadAvatarPhoto(userId){
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

function getUsersGarageById(){
    var path = window.location.pathname.split('/');
    var garageUserId = path[3];
    //
    superUtil.grabJSON(('/api/garage/items/user/'+garageUserId), function (status, data) {
        //console.log('data: '. data);
        //console.log(status);
        if(status != 200){
            document.querySelector('body').innerHTML = '<h1>'+JSON.parse(data).message+'</h1>';
            setTimeout(function(){
                window.location = '/garage';
            },1000);
        } else if (data.length == 0){
            //console.log('throw message about nothing here');
            document.querySelector('.blueBox').innerHTML = '<h1>There are no items here</h1>';
            setTimeout(function(){
                window.location = '/garage';
            },1000);
        } else {
            var groupedByCategory = _.groupBy(data, function(m){          
                //console.log(m);      
                return m.category;
            });

            buildUserGarage(groupedByCategory);
        }
  
    });
};

function getFirstLastName(userId) {
    var displaynameText = document.querySelector('.garageOwner');
    superUtil.grabJSON('/api/garage/displayName/'+(userId), function (status, data){
        if(status == 200) {
            displaynameText.innerHTML = (data.firstName + ' ' + data.lastName);
        } else {
            console.log(status, data);
        }
    });
};

function buildUserGarage(garageItemsByCat){
    var items = Object.entries(garageItemsByCat);
    var garageItemWrapper = document.querySelector('.garageItemWrapper ul');
    //items = items.reverse();
    //console.log(Object.entries(garageItemsByCat));
    for(var c = 0; c<=items.length-1; c++){
        //console.log('append cat: ', items[c]);
        // add box by group
        garageItemWrapper.innerHTML +="<li>"+
                                            "<div class='garageCategoryWrapper gItemLabel_"+items[c][0]+"'><h3 class='catTitle'>"+items[c][0]+"</h3></div>"+
                                      "</li>";
        //console.log('items: ', items[c][1]);
        // then, add items within the box by group
        var individualItems = items[c][1].reverse();
        for(var i = 0; i<=individualItems.length-1; i++){
            var cat = document.querySelector('.gItemLabel_'+items[c][0]);
            // var itemPath = ('/garage/item/'+items[c][1][i]._id);

            // console.log('append each item: ', items[c][0]);
            // console.log('append each item: ', items[c][1][i]);
            cat.innerHTML += "<br/><div class='garageItem'>"+
                            "<h4>"+items[c][1][i].title+"</h4>"+
                                "<div class='imageBoxWrapper' onclick=gotoLocation('"+items[c][1][i]._id+"');>"+
                                    "<img src='/garageImages/"+items[c][1][i]._id+"/garageItemImage_1.jpg' width='23%'/>"+
                                    "<img src='/garageImages/"+items[c][1][i]._id+"/garageItemImage_2.jpg' width='23%'/>"+
                                    "<img src='/garageImages/"+items[c][1][i]._id+"/garageItemImage_3.jpg' width='23%'/>"+
                                "</div>"+
                            "</div>";
        }
    }
};

function gotoLocation(path) {
    console.log(path);
    window.location = '/garage/item/'+path;
}