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
                //console.log('handle data for users garage.');
            //console.log(data);
            //var sortedArray = _.sortBy(data, function(o) { return o.date });//.reverse();
            
        //    var sortedByDate =  _.sortBy(data, function (o){
        //         console.log(o);
        //         return o.date;
        //     });
            // var lodash = _;
            // console.log(lodash.sortBy());
            // _.groupBy(sortedByDate, function(i){
            //     console.log('i', i);
            // }); 
            var groupedByCategory = _.groupBy(data, function(m){          
                //console.log(m);      
                return m.category;
            });
            //console.log('groupedItems: ', groupedByCategory);
            buildUserGarage(groupedByCategory);
        }
  
    });
};

function buildUserGarage(garageItemsByCat){
    var items = Object.entries(garageItemsByCat);
    var garageItemWrapper = document.querySelector('.garageItemWrapper ul');
    //console.log(Object.entries(garageItemsByCat));
    for(var c = 0; c<=items.length-1; c++){
        console.log('append cat: ', items[c]);
        // add box by group
        garageItemWrapper.innerHTML +="<li>"+
                                            "<div class='garageCategoryWrapper gItemLabel_"+items[c][0]+"'><span class='catTitle'>"+items[c][0]+"</span></div>"+
                                      "</li>";
        console.log('items: ', items[c][1]);
        // then, add items within the box by group
        for(var i = 0; i<=items[c][1].length-1; i++){
            var cat = document.querySelector('.gItemLabel_'+items[c][0]);
            console.log('append each item: ', items[c][0]);
            console.log('append each item: ', items[c][1][i]);
            cat.innerHTML += "<br/><div class='garageItem'>"+
                            "<span>"+items[c][1][i].title+"</span>"+
                                "<div class='imageBoxWrapper'>"+
                                    "<img src='/garageImages/"+items[c][1][i]._id+"/garageItemImage_1.jpg' width='23%'/>&nbsp;"+
                                    "<img src='/garageImages/"+items[c][1][i]._id+"/garageItemImage_2.jpg' width='23%'/>"+
                                    "<img src='/garageImages/"+items[c][1][i]._id+"/garageItemImage_3.jpg' width='23%'/>"+
                                "</div>"+
                            "</div>";
        }
    }
};