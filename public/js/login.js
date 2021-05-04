var superUtil = new SuperUtil();

document.addEventListener("DOMContentLoaded", function(){
	//superUtil.init(document);
	var loginBtn = superUtil.grabElement('loginBtn');
	var emailInput = superUtil.grabElement('loginEmailInput');
	var passwordInput = superUtil.grabElement('loginPasswordInput');
	var responsMessages = superUtil.grabElement('serverMessages');
	var loginErrorMessages = superUtil.grabElement('loginErrorMessages');
	//
	loginBtn.addEventListener('click', function(data) {
		var postData = {
			username: emailInput.value,
			password: passwordInput.value
		};
		// make a global method
		superUtil.sendJSON(postData, 'api/login', function (status, response){
			console.log(status, response.message);
			//message = response;
			console.log(response);
			
			if(status != 200){
				loginErrorMessages.innerHTML = response.message;
			} else if(status == 200) {
				localStorage.setItem('userId', response.userId);
				localStorage.setItem('token', response.token);
				localStorage.setItem('username', response.email);
				responsMessages.innerHTML = 'Success!! You are logged in. (Redirecting you to your profile)';
				window.location = '/profile';
			}
		}, 'POST');
	});

	document.addEventListener('keydown', function (e) {
		if(e.code == 'Enter'){
			var postData = {
				username: emailInput.value,
				password: passwordInput.value
			};
			// make a global method
			superUtil.sendJSON(postData, 'api/login', function (status, response){
				console.log(status, response.message);
				//message = response;
				console.log(response);
				
				if(status != 200){
					loginErrorMessages.innerHTML = response.message;
				} else if(status == 200) {
					localStorage.setItem('userId', response.userId);
					localStorage.setItem('token', response.token);
					localStorage.setItem('username', response.email);
					responsMessages.innerHTML = 'Success!! You are logged in. (Redirecting you to your profile)';
					window.location = '/profile';
				}
			}, 'POST');
		}
	});

	// Check Token, Go to the profile if there is a valid token. There is no need to login if there is a valid token.
	var token = localStorage.getItem('token');
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
		if(status == 200 && data.authenticated == true){
			console.log('go to profile');
			window.location = '/profile';
			
		} else {
			localStorage.removeItem('token');
			//window.location = '/login';
		}
    });
	
});

function loginControl(){

}

function openModal(modalType){
	console.log('modalType: ', modalType);
	document.querySelector(modalType).style.display = 'block';
}

function closeModal(modalType){
	document.querySelector(modalType).style.display = 'none';
}

function resetPasswordRequest(){
	var updatePassEmailText = document.querySelector('.updatePassEmail').value;
	var errorMessages = document.querySelector('.forgotPasswordModal .errorMessages p');
	var responseMessages = document.querySelector('.forgotPasswordModal .responseMessages p');
	
	var postData = {
		userEmail: updatePassEmailText
	}

	superUtil.sendJSON(postData, 'api/resetPassword', function (status, response){
		console.log(status, response.message);
		//message = response;
		console.log(response);
		
		if(status != 200){
			errorMessages.innerHTML = response.message;
			responseMessages.innerHTML = '';
		} else if(status == 200) {
			responseMessages.innerHTML = response.message;
			errorMessages.innerHTML = '';
		}
	}, 'POST');
}