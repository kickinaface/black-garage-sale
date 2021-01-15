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
				callback(status, JSON.parse(xhr.response));
			}else {
				callback(status, xhr.response);
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
		//xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = function () { 
			var json = JSON.parse(xhr.responseText);
			console.log(json);
		    if (xhr.readyState == 4 && xhr.status == 200) {
		        
				console.log(xhr.response);
				callback(xhr.status,json);
		    } else {
				callback(xhr.status, json);
			}
		}
		var data = JSON.stringify(postData);

		if(postType == 'DELETE') {
			xhr.send(null);
		} else {
			xhr.send(data);
		}
	};

	function privateMethod() {
		console.log('run privateMethod');
	}

};

function Navigation(){
	this.init = function init(navEl, links) {
		this.navigation = navEl;
		buildLinks(links, navEl);
	};
	function buildLinks(links, nav){
		// Append links to navigation element.
		for(var n = 0; n<=links.length-1; n++){
			nav.querySelector('.navLinks').innerHTML +=
				"<li><a href='"+links[n].link+"'>"+links[n].title+"</a></li>";
		}
	};
};
