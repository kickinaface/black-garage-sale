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

            var itemsSortedByDate = _.sortBy(usersOwnedItems, function(o) { return new moment(o.date); }).reverse();
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
                            "<span class='itemPrice'>$"+ itemsSortedByDate[o].price +"</span>"+
                            "<br>"+
                            "<br>"+
                            "<span><b><i>"+ itemsSortedByDate[o].category +"</i></b></span>"+
                            "<br>"+
                            "<span><i>Posted: "+ moment(itemsSortedByDate[o].date).fromNow() +"</i></span>"+
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

function addNewGarageItem(){
    var itemTitle = document.querySelector('.addItemModal .itemTitle');
    var itemDescription = document.querySelector('.addItemModal .itemDescription');
    var itemCategory = document.querySelector('.addItemModal .itemCategory');
    var itemQty = document.querySelector('.addItemModal .itemQty');
    var itemPrice = document.querySelector('.addItemModal .itemPrice');
    //
    var errorMessages = document.querySelector('.addItemModal .errorMessages p');
    var responseMessages = document.querySelector('.addItemModal .responseMessages p');
    //
    var postData = {
        itemCreatedBy: userId,
        itemTitle: itemTitle.value,
        itemDescription: itemDescription.value,
        itemCategory: itemCategory.value,
        itemQuantity: itemQty.value,
        itemPrice: itemPrice.value
    };
    // console.log('postData: ', postData);
    superUtil.authPostRequest(postData, 'api/garage/add', function (status, response) {
        // console.log(status, response);
        if(status != 200){
            errorMessages.innerHTML = response.message;
            responseMessages.innerHTML = '';
            
        } else if(status == 200) {
            responseMessages.innerHTML = 'Item has been added. Please wait...';
            errorMessages.innerHTML = '';
            setTimeout(function(){
                location.reload();
            },3000);
        }
    },'POST');
};

function getGarageItemById(){
    var editItemIDText = document.querySelector('.editItemIDText');
    var responseMessages = document.querySelector('.editItemModal .responseMessages');
    var errorMessages = document.querySelector('.editItemModal .errorMessages');
    var editItemModal = document.querySelector('.editItemModal .modal .editItemWrapperContent');
    //
    superUtil.getAuthenticatedRequest(token, ('api/garage/item/'+editItemIDText.value), function (status, data) {
        if(status == 200) {
            //console.log('SUCCESS: ', status, data);
            errorMessages.innerHTML = '';
            editItemModal.innerHTML +=
            "<p>"+
            "<label for='editItemImage1'>Edit Image 1</label>"+
            "<input type='file' id='editItemImage1' accept='image/png, image/jpeg' name='editItemImage1'/>"+
            "<button type='submit' class='uploadImageButton'>Upload Image 1</button>"+
        "</p>"+
        "<br>"+
        "<p>"+
            "<label for='editItemImage2'>Edit Image 2</label>"+
            "<input type='file' id='editItemImage2' accept='image/png, image/jpeg' name='editItemImage2'/>"+
            "<button type='submit' class='uploadImageButton'>Upload Image 2</button>"+
        "</p>"+
        "<br>"+
        "<p>"+
            "<label for='editItemImage3'>Edit Image 3</label>"+
            "<input type='file' id='editItemImage3' accept='image/png, image/jpeg' name='editItemImage3'/>"+
            "<button type='submit' class='uploadImageButton'>Upload Image 3</button>"+
        "</p>"+
        "<br>"+
        "<p>"+
            "<p><label for='editItemTitle'>Edit Item Title</label></p>"+
            "<input type='text' class='editItemTitle' placeholder='"+data.title+"' value='"+data.title+"'>"+
        "</p>"+
        "<br>"+
        "<p>"+
            "<p><label for='editItemDescription'>Edit Item Description</label></p>"+
            "<textarea name='editItemDescription' cols='30' rows='10' class='editItemDescription' placeholder='"+data.description+"'>"+data.description+"</textarea>"+
        "</p>"+
        "<br>"+
        "<br>"+
        "<p>"+
            "<label for='editItemCategory'>Edit Item Category</label>"+
            "<br>"+
            "Currently Selected Category: <i>"+data.category+"</i>"+
            "<br>"+
            "<select name='editItemCategory' class='editItemCategory'>"+
                "<option value='Automotive'>Automotive</option>"+
                    "<option value='Books'>Books</option>"+
                    "<option value='Crafts'>Crafts</option>"+
                    "<option value='Construction'>Construction</option>"+
                    "<option value='Electronics'>Electronics</option>"+
                    "<option value='Garden'>Garden</option>"+
                    "<option value='Home'>Home</option>"+
                    "<option value='Jewelry'>Jewelry</option>"+
                    "<option value='Other'>Other</option>"+
            "</select>"+
        "</p>"+
        "<br>"+
        "<br>"+
        "<p>"+
            "<p><label for='editItemQty'>Edit Item Quantity</label></p>"+
            "<input type='number' class='editItemQty' name='editItemQty' min='1' placeholder='"+data.quantity+"' value='"+data.quantity+"'>"+
        "</p>"+
        "<br>"+
        "<p>"+
            "<p><label for='editItemPrice'>Edit Item Price $</label></p>"+
            "<input type='text' class='editItemPrice' name='editItemPrice' placeholder='"+data.price+"' value='"+data.price+"'>"+
        "</p>"+
        "<br>"+
        "<p>"+
            "<p><label for='editItemSoldStatus'>Item is Sold</label></p>"+
            "<input type='checkbox' name='editItemSoldStatus' class='editItemSoldStatus' value='soldStatus'>"+
        "</p>"+
        "<br>"+
        "<p>"+
            "<p><label for='editItemAvailableStatus'>Item Un-Available (Out of Stock)</label></p>"+
            "<input type='checkbox' name='editItemAvailableStatus' class='editItemAvailableStatus' value='availableStatus'>"+
        "</p>"+ 
        
        "<button type='button' onclick='removeBasicUser();'>Save Edit Item</button>"+
        "<br>"+
        "<br>";
            // Set isSold checkbox
            if(data.isSold == true){
                document.querySelector('.editItemSoldStatus').checked = true;
            } else if(data.isSold == false){
                document.querySelector('.editItemSoldStatus').checked = false;
            }
            // Set isAvailable checkbox
            if(data.isAvailable == true){
                document.querySelector('.editItemAvailableStatus').checked = false;
            } else if(data.isAvailable == false){
                document.querySelector('.editItemAvailableStatus').checked = true;
            }
        } else if(status != 200) {
            //console.log('ERROR: ', status, data);
            editItemModal.innerHTML = '';
            errorMessages.innerHTML = data.message;
        }
    });
}