var superUtil = new SuperUtil();
var token = localStorage.getItem('token');
var userId = localStorage.getItem('userId');
var usersOwnedItems = [];
//
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

    // Check Token, Go to the Login if there is an invalid token.
    //var token = localStorage.getItem('token');
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
        console.log('authenticated: ', status, data);
        if(status != 200 && data.authenticated != true){
            console.log('go to login');
            window.location = '/login';
        }
    });

    appTimer();
    getGarageItemsForUser(token, userId);
});

function appTimer() {
    var minuteCount = 1;
    var timeMinuteSet = 13;
    var appTimer = setInterval(function(){
        
        minuteCount ++;
        console.log('interval ', minuteCount);
        if(minuteCount == timeMinuteSet) {
            minuteCount = 1;
            console.log('interval ', minuteCount);
            superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
                if(status == 200 && data.authenticated == true){
                    // User is logged in and authenticated
                } else {
                    //console.log('go to profile');
                    window.location = '/logout';
                    //localStorage.removeItem('token');
                }

            });
        }
    },(1000* 60));

    //console.log('later clear interval: ', appTimer);
};

function closeModal(sClass) {
    document.querySelector(sClass).style.display = 'none';
};

function openModal(modalType) {
    document.querySelector(modalType).style.display = 'block';
};

function getGarageItemsForUser(token, userId){
    //Get users owned items
    superUtil.getAuthenticatedRequest(token, ('api/garage/items/'+userId), function (status, data){
        if(status == 200){
            //console.log(data);
            usersOwnedItems = data;

            var itemsSortedByDate = _.sortBy(usersOwnedItems, function(o) { return new moment(o.date); });//.reverse();
            var garageItems = document.querySelector('.garageItems');

            if(itemsSortedByDate.length == 0){
                // console.log('empty');
            } else {
                garageItems.innerHTML = "<h4>My Garage Items</h4><ul></ul>";

                for(var o = 0; o<=itemsSortedByDate.length-1; o++){
                    garageItems.innerHTML += "<li>"+
                                            "<div class='garageItemWrapper'>"+
                                                "<span><b>"+itemsSortedByDate[o].title+"</b></span>"+
                                                "<br>"+
                                                "<span>"+ itemsSortedByDate[o].description +"</span>"+
                                                "<br>"+
                                                "<br>"+
                                                "<span><b><i>"+ itemsSortedByDate[o].category +"</i></b></span>"+
                                                "<br>"+
                                                "<span><i>Posted: "+ moment(itemsSortedByDate[o].date).fromNow() +"</i></span>"+
                                                "<br>"+
                                                "<span class='itemPrice'>$"+ itemsSortedByDate[o].price +"</span>"+
                                                "<br>"+
                                                "<button class='editItemInListButton'>Edit</button> <button class='editItemInListButton'>View</button> <button class='editItemInListButton'>Remove</button>"+
                                            "</div>"+
                                        "</li>";
                }
            }

            
        } else {
            //console.log(status);
            console.log(data);
        }
    });

    
};
