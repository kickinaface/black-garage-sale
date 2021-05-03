var superUtil = new SuperUtil();
var token = localStorage.getItem('token');
var userId = localStorage.getItem('userId');
var savedUsername = localStorage.getItem('username');
var reformmatedCombinedMessages = [];
var isChatPanelOpen = false;
var oldMessagesLength = 0;
var isMobile = false;

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
   // var token = localStorage.getItem('token');
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
        //console.log('authenticated: ', status, data);
        if(status != 200 && data.authenticated != true){
            console.log('go to login');
            localStorage.removeItem('token');
            window.location = '/login';
        }
    });
    
    appTimer();
    messageChatTimer(5);
    getMessagesForUser(userId, token);
    getFirstLastName();
    loadAvatarPhoto();
    checkMessageUrl();
    mobileAdapt();
    getNotificationSettings(token);
});

function getNotificationSettings(token){
    superUtil.getAuthenticatedRequest(token, 'api/user/messagEmailSetting', function (status, data){
        if(status == 200){
            document.querySelector('.allowEmailisChecked').checked = data.emailMessages;
        }
    });
}

function mobileAdapt(){
    var setWidthLimit = 600;
    var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;

    if(width <= setWidthLimit){
        isMobile = true;
    } else {
        isMobile = false;
    }
    //
    window.addEventListener('resize', function (w){
        if(w.target.innerWidth<=setWidthLimit){
            isMobile = true;
        } else {
            isMobile = false;
        }
    });
    
};

function checkMessageUrl() {
    var path = location.search;
    var messageFromId = path.split('?createdBy=')[1];
    // If the url contains the proper path initiate
    if(messageFromId !=undefined){
        messageFromId = messageFromId.split('&garageItemId=')[0];
        var garageItemId = path.split('&garageItemId=')[1];
        superUtil.getAuthenticatedRequest(token, ('api/getUsername/'+messageFromId), function (status, data){
            if(status == 200 && data.authenticated == true){
                // User is logged in and authenticated
                var toMessageEmail = data.email;
                if(savedUsername == toMessageEmail){
                    alert("You cannot send a message to yourself.");
                } else {
                    openSendMessageModal('.sendUserMessageModal');
                    document.querySelector('.toEmailAddress').value = toMessageEmail;
                    var buyThisItemMessage = (savedUsername+ " wants to buy your item. itemID: "+ garageItemId);
                    document.querySelector('.messageToUser').innerHTML = buyThisItemMessage;
                }
                
            } else {
                console.log(status, data);
            }
        });
    }
}

function messageChatTimer(inSeconds){
    var chatTimer = setInterval(function(){
        getMessagesForUser(userId, token);
    },(inSeconds * 1000));
}

function appTimer() {
    setInterval(function(){
        superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
            if(status == 200 && data.authenticated == true){
                // User is logged in and authenticated
                // console.log('valid token');
            } else {
                //logout
                localStorage.removeItem('token');
                window.location = '/logout';
            }

        });
    },(1000* 60));

    //console.log('later clear interval: ', appTimer);
};

function authCheck(){
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
        if(status == 200 && data.authenticated == true){
            // User is logged in and authenticated
            // console.log('valid token');
        } else {
            //logout
            localStorage.removeItem('token');
            window.location = '/logout';
        }
    });
}

function openSendMessageModal(modalType){
    authCheck();
    if(modalType == '.sendUserMessageModal'){
        document.querySelector(modalType).style.display = 'block';
    }
    // } else if (modalType == 'changeName') {
    //     document.querySelector('.changeName').style.display = 'block';
    // }
};

function closeModal(sClass) {
    document.querySelector(sClass).style.display = 'none';
};

function sendMessageToUser(methodType){
    authCheck();
    if(methodType == 'modal'){
        var toEmailAddressText = document.querySelector('.sendUserMessageModal .toEmailAddress');
        var messageToUserText = document.querySelector('.sendUserMessageModal .messageToUser');
        var errorMessages = document.querySelector('.sendUserMessageModal .errorMessages p');
        var responseMessages = document.querySelector('.sendUserMessageModal .responseMessages p');
        var postData = {
            toUser:toEmailAddressText.value,
            fromUser:savedUsername,
            message: messageToUserText.value,
            fromAvatarId: userId
        };
        
    } else if(methodType == 2){
        var toEmailAddressText = document.querySelector('.sendMessageContentWrapper .sendMessageToUser');
        var messageToUserText = document.querySelector('.sendMessageContentWrapper .responseInputField');
        var errorMessages = document.querySelector('.sendMessageContentWrapper .errorMessages p');
        var responseMessages = document.querySelector('.sendMessageContentWrapper .responseMessages p');
        var postData = {
            toUser:toEmailAddressText.innerHTML,
            fromUser:savedUsername,
            message: messageToUserText.value,
            fromAvatarId: userId
        };
    }
    //
    superUtil.authPostRequest(postData, 'api/messages/', function (status, response){
        console.log(status, response.message);
        //message = response;
        //console.log(responsMessages);
        
        if(status != 200){
            errorMessages.innerHTML = response.message;
            responseMessages.innerHTML = '';
            
        } else if(status == 200) {
            responseMessages.innerHTML = '';
            errorMessages.innerHTML = '';
            messageToUserText.value = '';
            responseMessages.innerHTML = response.message;
            setTimeout(function (){
                closeModal('.sendUserMessageModal');
            },1000);
            
        }
    }, 'POST');

}

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

function loadAvatarPhoto(){    
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

function gotoBottom(id){
    var element = document.querySelector(id);
    element.scrollTop = element.scrollHeight - element.clientHeight;
 }

function getMessagesForUser(userId, token){
    superUtil.getAuthenticatedRequest(token, 'api/messages/forUser/'+(userId), function (status, data){
        //console.log(status);
        if(status != 200){
            console.log('error')
        } else if(status == 200) {
            var messageGroupedByUser = Object.entries(data);
            var newData = Object.keys(data);
            var numConversations = newData.length;
            var allCombinedMessages = [];
            var leftPanel = document.querySelector('.userMessagePreviewWrapper');
            // empty previous array of messages
            reformmatedCombinedMessages = [];

            for(var m = 0; m <=numConversations-1; m++){
                allCombinedMessages.push(data[newData[m]]);
            }

            // Loop through the allCombinedMessages and refomat array for later use.
            for(var l = 0; l <=allCombinedMessages.length-1; l++){
                for(var n = 0; n<= allCombinedMessages[l].length-1; n++){
                    reformmatedCombinedMessages.push(allCombinedMessages[l][n]);
                }
            }
            // Only update the interface if we have new messages
            if(reformmatedCombinedMessages.length > oldMessagesLength){
                // Set new and old message values to be compared for populating new messages
                oldMessagesLength = reformmatedCombinedMessages.length;
                leftPanel.innerHTML = '';
                //append new grouped messages to html
                for(c = 0; c<=messageGroupedByUser.length-1; c++){
                    var userEmailAddress = messageGroupedByUser[c][0];

                    if(userEmailAddress == savedUsername){
                        // console.log('this is user data entries all combined, just show other users');
                    } else {
                        
                        leftPanel.innerHTML += '<div class="messageWrapper" onclick="loadMessagesWithUser(event);">'+
                                                    '<div class="messageicon">'+
                                                        '<img class="leftPanelAvatar" src="/img/default-profile-icon-16.png" width="50px;" alt="">'+
                                                            '<div class="messagePreview">'+
                                                                '<div class="messageFromUser">'+userEmailAddress+'</div>'+
                                                            '</div>'+
                                                    '</div>'+
                                                    '<div class="userEmailAddress">'+userEmailAddress+'</div>'+
                                                '</div>';
                    }
                }
                //
                loadMessagesWithUser(null);
                // Add in left panel profile images
                var leftPanelConversations = document.querySelectorAll('.messageWrapper');

                for(var lpc = 0; lpc<= leftPanelConversations.length-1; lpc++){
                    var leftPanelConvoUser = leftPanelConversations[lpc].querySelector('.messagePreview .messageFromUser').innerHTML;
                    var leftPanelConvoUserImage = leftPanelConversations[lpc].querySelector('.leftPanelAvatar');

                    // search all messages for users avatar id and use it
                    for(var am = 0; am<=reformmatedCombinedMessages.length-1; am++){
                        if(reformmatedCombinedMessages[am].fromUser == leftPanelConvoUser){
                            var leftPanelAvatarId= reformmatedCombinedMessages[am].fromAvatarId;
                            leftPanelConvoUserImage.src = ('/avatar/'+leftPanelAvatarId+'/avatarImage.jpg');
                        }
                    }
                }
            } else {
                //console.log('do nothing')
            }
            //
        }
        
    });
}

function loadMessagesWithUser(e) {
    authCheck();
    var withUser = null;

    if(e != null) {
        isChatPanelOpen = true;
        withUser = e.currentTarget.querySelector('.messagePreview .messageFromUser').innerHTML;
        // adjust css for displaying chat messages upon clicking left panel interaction
        document.querySelector('.chatDetails').style.height = '500px';
        document.querySelector('.chatText').style.display = 'block';
        document.querySelector('.sendMessageContentWrapper').style.display = 'block';
        //Hide under text 
        document.querySelector('.chatInstructions').style.display = 'none';
        //
        // adjust css for left panel user clicking the recent message. Upon clicking
        var messageWrapper = document.querySelectorAll('.messageWrapper');
        for(var m=0; m<=messageWrapper.length-1; m++){
            messageWrapper[m].style.background = 'white';
            messageWrapper[m].style.color = 'black';
        }
        e.currentTarget.style.background = 'black';
        e.currentTarget.style.color = 'white';
        //
        // If in mobile view and clicked, apply show hide logic for messages and 
        // append the close button to toggle show hide
        if(isMobile){
            document.querySelector('.leftMessagesTab').style.display = 'none';
            // document.querySelector('.chatMessagesTab').style.float = 'left';
            // document.querySelector('.chatMessagesTab').style.width = '900px';
            document.querySelector('.chatMessagesTab').style.display = 'block';
        }

    } else if (e == null && isChatPanelOpen == true){
        withUser = document.querySelector('.sendMessageContentWrapper .sendMessageToUser').innerHTML;
    }
    var chatText = document.querySelector('.chatText ul');
    var conversationWithUser = [];
    //
    // Loop through reformatted combined messages and create conversation array per user matching clicked conversation address
    for(var c = 0; c<=reformmatedCombinedMessages.length-1; c++){
        // Place all TO and FROM messages of the user into conversation array.
        if(reformmatedCombinedMessages[c].toUser == withUser) {
            conversationWithUser.push(reformmatedCombinedMessages[c]);
        }
        if(reformmatedCombinedMessages[c].fromUser == withUser) {
            conversationWithUser.push(reformmatedCombinedMessages[c]);
        }
    }

    // Format the conversation by date
    var sortedArray = _.sortBy(conversationWithUser, function(o) { return new moment(o.date); });//.reverse();
    var sendMessageToUser = null;
    
    // clear out chat text before loading new conversation
    chatText.innerHTML =  '';
    // Append the conversation to the chat element
    for(convo = 0; convo <= sortedArray.length-1; convo++) {
        var formattedDate = moment(sortedArray[convo].date).format('MMMM DD, YYYY');
        //
        if(sortedArray[convo].toUser == savedUsername) {
            sendMessageToUser = sortedArray[convo].fromUser;
            chatText.innerHTML+= "<li>"+
                                "<div class='leftMessage'>"+
                                    "<div class='chatAvatar'><img src='/avatar/"+sortedArray[convo].fromAvatarId+"/avatarImage.jpg' width='50px;'></div>"+
                                    "To: "+sortedArray[convo].toUser+
                                    "<br/> From: "+sortedArray[convo].fromUser+
                                    "<br/>"+
                                    "Date: "+formattedDate+
                                    "<br/>"+
                                    "<p>"+sortedArray[convo].message+"</p>"+
                                "</div>"+
                            "</li>";
        } else {
            sendMessageToUser = sortedArray[convo].toUser;
            chatText.innerHTML+= "<li>"+
                                "<div class='rightMessages'>"+
                                    "<div class='chatAvatar'><img src='/avatar/"+sortedArray[convo].fromAvatarId+"/avatarImage.jpg' width='50px;'></div>"+
                                    "To: "+sortedArray[convo].toUser+
                                    "<br/> From: "+sortedArray[convo].fromUser+
                                    "<br/>"+
                                    "Date: "+formattedDate+
                                    "<br/>"+
                                    "<p>"+sortedArray[convo].message+"</p>"+
                                "</div>"+
                            "</li>";
        }
    }
    // Set message to user 
    document.querySelector('.sendMessageContentWrapper .sendMessageToUser').innerHTML = sendMessageToUser;
    //
    //console.log(document.querySelectorAll('.chatText ul li div'))
    // sort through message list and add links to itemID tag
    var openMessagesList = document.querySelectorAll('.chatText ul li div');
    //
    for(var om=0; om<= openMessagesList.length-1; om++){
        var specificMessageText = openMessagesList[om].innerHTML.split('itemID: ')[1];
        
        //console.log('message: ', openMessagesList[om].innerHTML);
        if(specificMessageText != undefined){
            specificMessageText = specificMessageText.replace('</p>','');
            //console.log('specificMessageText: ', specificMessageText.replace('</p>',''));
            openMessagesList[om].innerHTML += "<center><b><a href='/garage/item/"+specificMessageText+"'/>VISIT ITEM HERE</a></b></center>";
        }
    }
    //
    gotoBottom('.chatText');
    
}

function openModal(modalType) {
    document.querySelector(modalType).style.display = 'block';
}