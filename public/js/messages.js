var superUtil = new SuperUtil();
var token = localStorage.getItem('token');
var userId = localStorage.getItem('userId');
var savedUsername = localStorage.getItem('username');
var reformmatedCombinedMessages = [];
var isChatPanelOpen = false;

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
});

function messageChatTimer(inSeconds){
    var chatTimer = setInterval(function(){
        console.log('update messages');
        getMessagesForUser(userId, token);
    },(inSeconds * 1000));
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

function openSendMessageModal(modalType){
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
    if(methodType == 'modal'){
        var toEmailAddressText = document.querySelector('.sendUserMessageModal .toEmailAddress');
        var messageToUserText = document.querySelector('.sendUserMessageModal .messageToUser');
        var errorMessages = document.querySelector('.sendUserMessageModal .errorMessages p');
        var responseMessages = document.querySelector('.sendUserMessageModal .responseMessages p');
        var postData = {
            toUser:toEmailAddressText.value,
            fromUser:savedUsername,
            message: messageToUserText.value
        };
    } else if(methodType == 2){
        var toEmailAddressText = document.querySelector('.sendMessageContentWrapper .sendMessageToUser');
        var messageToUserText = document.querySelector('.sendMessageContentWrapper .responseInputField');
        var errorMessages = document.querySelector('.sendMessageContentWrapper .errorMessages p');
        var responseMessages = document.querySelector('.sendMessageContentWrapper .responseMessages p');
        var postData = {
            toUser:toEmailAddressText.innerHTML,
            fromUser:savedUsername,
            message: messageToUserText.value
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
            responseMessages.innerHTML = response.message;
            errorMessages.innerHTML = '';
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
    // var avatarUploadUserToken = document.querySelector('#avatarUploadUserToken');
    // avatarUploadUserToken.value = token;
    
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

            leftPanel.innerHTML = '';

            for(var m = 0; m <=numConversations-1; m++){
                allCombinedMessages.push(data[newData[m]]);
            }

            //append new grouped messages to html
            for(c = 0; c<=messageGroupedByUser.length-1; c++){
                //console.log('c: ', messageGroupedByUser[c][0]);
                var userEmailAddress = messageGroupedByUser[c][0];
                // console.log('userEmailAddress: ', userEmailAddress);
                // console.log('username: ', savedUsername);

                if(userEmailAddress == savedUsername){
                    // console.log('this is user data entries all combined, just show other users');
                } else {
                    
                        leftPanel.innerHTML += '<div class="messageWrapper" onclick="loadMessagesWithUser(event);">'+
                                                '<div class="messageicon">'+
                                                    '<img src="img/default-profile-icon-16.png" width="50px;" alt=""></div>'+
                                                        '<div class="messagePreview">'+
                                                            '<div class="messageFromUser">'+userEmailAddress+'</div>'+
                                                        '</div>'+
                                                    '</div>';
                }
            }
            // Loop through the allCombinedMessages and refomat array for later use.
            for(var l = 0; l <=allCombinedMessages.length-1; l++){
                //console.log('l: ', allCombinedMessages[l]);
                for(var n = 0; n<= allCombinedMessages[l].length-1; n++){
                    //console.log('n: ', allCombinedMessages[l][n]);
                    reformmatedCombinedMessages.push(allCombinedMessages[l][n]);
                }
            }
        }
        
    });
}

function loadMessagesWithUser(e) {
    isChatPanelOpen = true;
    var withUser = e.currentTarget.querySelector('.messagePreview .messageFromUser').innerHTML;
    var conversationWithUser = [];
    //
    // Loop through reformatted combined messages and create conversation array per user matching clicked conversation address
    for(var c = 0; c<=reformmatedCombinedMessages.length-1; c++){
        // Place all TO and FROM messages of the user
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
    var chatText = document.querySelector('.chatText ul');
    // clear out chat text before loading new conversation
    chatText.innerHTML =  '';
    // Append the conversation to the chat element
    for(convo = 0; convo <= sortedArray.length-1; convo++) {
        var formattedDate = moment(sortedArray[convo].date).format('MMMM d, YYYY');
        //
        if(sortedArray[convo].toUser == savedUsername) {
            sendMessageToUser = sortedArray[convo].fromUser;
            chatText.innerHTML+= "<li>"+
                                "<div class='leftMessage'>"+
                                    "<div class='chatAvatar'><img src='img/default-profile-icon-16.png' width='50px;'></div>"+
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
                                    "<div class='chatAvatar'><img src='img/default-profile-icon-16.png' width='50px;'></div>"+
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
    chatText.innerHTML +="<div class='sendMessageContentWrapper'>"+
                            "Send message to: <span class='sendMessageToUser'>"+sendMessageToUser+"</span>"+    
                            "<input type='text' class='responseInputField' placeholder='Send message'>"+
                            "<button type='button' onclick='sendMessageToUser(2)'>Send</button>"+
                            "<div class='responseMessages'>"+
                                "<p></p>"+
                            "</div>"+
                            "<div class='errorMessages'>"+
                                "<p></p>"+
                            "</div>"+
                        "</div>";
}