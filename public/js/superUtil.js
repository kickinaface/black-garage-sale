function SuperUtil(){
	var _this = this;
	this.doc = null;
	this.init = function init(doc) {
		//console.log('initiate SuperUtil');
		this.doc = doc;
		//console.log(_this);
	};

	this.initNavigation = function initNavigation(navElement, links){
		var navCtrl = new Navigation();
		navCtrl.init(this.grabElement(navElement), links);
	};

	//Grab any element and use it for later
	this.grabElement = function grabElement(element) {
		var arr = [].slice.call(_this.doc.all);
		var returnedElement = null;

		for(var i= 0; i<=arr.length-1; i++){
			if(arr[i].className == element){
				//console.log('foundElement: ', arr[i]);
				returnedElement = arr[i];
				//return true;
			}else {
				//console.log('notfound;')
				//return false;
			}
		};
		return returnedElement;
	};

	// Get JSON from server
	this.grabJSON = function grabJSON(address, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', address, true);
		xhr.reponseType = 'json';
		xhr.onload = function () {
			var status = xhr.status;
			if(status === 200){
				callback(status, JSON.parse(xhr.response));
			}else {
				callback(status, xhr.response);
			}
		}
		xhr.send();
	};

	this.getAuthenticatedRequest = function getAuthenticatedRequest(token, address, callback){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', address, true);
		xhr.setRequestHeader('Authorization', 'Bearer '+(token));
		xhr.reponseType = 'json';
		xhr.onload = function () {
			var status = xhr.status;
			if(status === 200){
				//console.log(xhr.response);
				callback(status, JSON.parse(xhr.response));
			}else {
				callback(status, JSON.parse(xhr.response));
			}
		}
		xhr.send();
	}

	// Send JSON to server
	this.sendJSON = function sendJSON(postData, address, callback, postType){
		var xhr = new XMLHttpRequest();
		var url = address;
		xhr.open(postType, url, true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = function () { 
			var json = JSON.parse(xhr.responseText);
		    if (xhr.readyState == 4 && xhr.status == 200) {
				console.log(xhr.response);
				callback(xhr.status,json);
		    } else {
				callback(xhr.status, json);
			}
		}
		var data = JSON.stringify(postData);
		xhr.send(data);
		// if(postType == 'DELETE') {
		// 	xhr.send(null);
		// } else {
		// 	xhr.send(data);
		// }
		
	};

	this.authPostRequest = function authPostRequest(postData, address, callback, postType) {
		var xhr = new XMLHttpRequest();
		var url = address;
		xhr.open(postType, url, true);
		xhr.setRequestHeader('Authorization', 'Bearer '+(token));
		xhr.reponseType = 'json';
		
		xhr.onreadystatechange = function () { 
			var json = JSON.parse(xhr.responseText);
			//console.log(json);
		    if (xhr.readyState == 4 && xhr.status == 200) {
				//console.log(xhr.response);
				callback(xhr.status,json);
		    } else {
				callback(xhr.status, json);
			}
		}
		
		//console.log(postType);
		if(postType == 'DELETE') {
			xhr.send(null);
		} else if(postType == 'POST' || postType == 'PUT'){
			//Format data and header for posting proper JSON
			var data = JSON.stringify(postData);
			xhr.setRequestHeader("Content-type", "application/json");
			xhr.send(data);
		}
	};
};

function Navigation(){
	this.init = function init(navEl, links) {
		this.navigation = navEl;
		buildLinks(links, navEl);
		listenForMessages(userId, token, navEl);
	};
	function buildLinks(links, nav){
		// Append links to navigation element.
		for(var n = 0; n<=links.length-1; n++){
			nav.querySelector('.navLinks').innerHTML +=
				"<li><a href='"+links[n].link+"'>"+links[n].title+"</a></li>";
		}
	};

	function listenForMessages(userId, token, el){
		var oldMessagesLength = 0;
		var checkMessagePageCount = 0;

		var messagesListener = setInterval(function(){
			
			superUtil.getAuthenticatedRequest(token, 'api/messages/forUser/'+(userId), function (status, data){
				if(status != 200){
					clearInterval(messagesListener);
				} else if(status == 200){
					checkMessagePageCount++;
					var newData = Object.keys(data);
					var numConversations = newData.length;
					var allCombinedMessages = [];

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
						// Only after the page count has increased do we add an indicator light. Yet,
						// if will only show when the oldMessagesLength count is increasing otheriwise
						// it does not even appear.
						if(checkMessagePageCount > 1){
							el.innerHTML+="<div class='messageIndicatorLight'></div>";
						}
						
					} else {
						// Dont do anything because there are no new messages.
						//console.log('there are no new messages.')
					}
				}
			});
		},(10000));
	}
};
