var superUtil = new SuperUtil();

document.addEventListener("DOMContentLoaded", function(){
	//superUtil.init(document);
	var loginBtn = superUtil.grabElement('loginBtn');
	var emailInput = superUtil.grabElement('loginEmailInput');
	var passwordInput = superUtil.grabElement('loginPasswordInput');
	var responsMessages = superUtil.grabElement('serverMessages');

	loginBtn.addEventListener('click', function(data) {
		var postData = {
			username: emailInput.value,
			password: passwordInput.value
		};

		superUtil.sendJSON(postData, 'api/login', function (status, response){
			console.log(status, response.message);
			//message = response;
			//console.log(responsMessages);
			
			if(status != 200){
				responsMessages.innerHTML = response.message;
			} else if(status == 200) {
				localStorage.setItem('token', response.token);
				responsMessages.innerHTML = 'Success!! You are logged in. (Redirecting you to your profile)';
				window.location = '/profile';
			}
		});
	});

	// Check Token, Go to the profile if there is a valid token. There is no need to login if there is a valid token.
	var token = localStorage.getItem('token');
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
		if(status == 200 && data.authenticated == true){
			console.log('go to profile');
			window.location = '/profile';
			//localStorage.removeItem('token');
		}
    });
	
});