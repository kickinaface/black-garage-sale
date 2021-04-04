var superUtil = new SuperUtil();
var token = localStorage.getItem('token');
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

    // Check default search by item
    document.querySelector('.searchForItems').checked = true;
    document.querySelector('.searchForUsers').checked = false;

});

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
    },(1000*60));
};

function performSearch(){
    var searchInputText = document.querySelector('.searchInputText').value;
    var searchForItems = document.querySelector('.searchForItems').checked;
    var searchForUsers = document.querySelector('.searchForUsers').checked;
    var responseMessages = document.querySelector('.searchWrapper .responseMessages');
    var errorMessages = document.querySelector('.searchWrapper .errorMessages');
    var searchType = null;
    var resultsWrapper = document.querySelector('.resultsWrapper ul');

    if(searchForItems == false && searchForUsers == true){
        searchType = 'user'
    } else if(searchForUsers == false && searchForItems == true){
        searchType = 'item'
    }

    superUtil.getAuthenticatedRequest(token, ('api/search/?lookingFor='+searchInputText+'&searchType='+searchType), function (status, data){
        if(status != 200){
            responseMessages.innerHTML = '';
            errorMessages.innerHTML = data.message;
        } else {
            errorMessages.innerHTML = '';
            if(data.length == 0){
                resultsWrapper.innerHTML = '';
                errorMessages.innerHTML = 'Sorry, there are no results for this search';
            } else {
                resultsWrapper.innerHTML = '';
                if(searchType == 'item'){
                    for(var d = 0; d<= data.length-1; d++){
                        resultsWrapper.innerHTML+="<li class='listItem' id="+data[d]._id+">"+
                                                        "<b>"+data[d].title+"</b>"+
                                                        "<div>"+data[d].description+"</div>"+
                                                        "<div><b>Category: </b>"+data[d].category+"</div>"+
                                                        "<div class='itemPrice'>$"+data[d].price+"</div>"+
                                                  "</li>";
                    }
                    var listItems = document.querySelectorAll('.listItem');

                    for(var item of listItems) {
                        item.addEventListener("click", function (e){
                            window.location = '/garage/item/'+e.currentTarget.id;
                        });
                    }

                    
                } else if(searchType == 'user'){
                    // console.log('build users');
                    // console.log(data);
                    for(var u = 0; u<=data.length-1; u++){
                        resultsWrapper.innerHTML += "<li class='listItem' id="+data[u]._id+">"+
                                                        "<div>"+data[u].username+"</div>"+
                                                        "<div><b>Role: </b>"+data[u].role+"</div>"+
                                                        "<div><b>First Name: </b>"+data[u].firstName+"</div>"+
                                                        "<div><b>Last Name: </b>"+data[u].lastName+"</div>"+
                                                    "</li>";
                    }
                    var listItems = document.querySelectorAll('.listItem');

                    for(var item of listItems) {
                        item.addEventListener("click", function (e){
                            window.location = '/garage/user/'+e.currentTarget.id;
                        });
                    }
                }
                
            }

        }
    });
};

function toggleSearchType(searchType) {
    document.querySelector('.'+ searchType).checked = false;
};