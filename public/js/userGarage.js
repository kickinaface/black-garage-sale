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
        console.log('data: '. data);
        console.log(status);
        if(status != 200){
            document.querySelector('.blueBox').innerHTML = '<h1>'+JSON.parse(data).message+'</h1>';
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
            console.log('groupedItems: ', groupedByCategory);
        }
  
    });
}