var superUtil = new SuperUtil();
var token = localStorage.getItem('token');
document.addEventListener("DOMContentLoaded", function(){
	//superUtil.init(document);
	var registerBtn = superUtil.grabElement('registerBtn');
	var emailInput = superUtil.grabElement('registerEmailInput');
    var passwordInput1 = superUtil.grabElement('registerPasswordInput1');
    var passwordInput2 = superUtil.grabElement('registerPasswordInput2');
	var responsMessages = superUtil.grabElement('serverMessages');

	registerBtn.addEventListener('click', function(data) {
		var postData = {
			username: emailInput.value,
			password: passwordInput2.value
        };
        if (passwordInput1.value != passwordInput2.value){
            responsMessages.innerHTML = 'Please enter the same password twice';
            console.log('passwordInput1.value ', passwordInput1.value);
        } else if(passwordInput1.value == passwordInput2.value){
            console.log('adsfsaf')
            superUtil.sendJSON(postData, 'api/user', function (status, response){
                console.log(status, response.message);
                //message = response;
                //console.log(responsMessages);
                
                if(status != 200){
                    responsMessages.innerHTML = response.message;
                } else if(status == 200) {
                    //localStorage.setItem('token', response.token);
                    responsMessages.innerHTML = response.message;
                    //window.location = '/login';
                }
            });
        }

	});

	// Check Token, Go to the profile if there is a valid token. There is no need to register if there is a valid token.
	//var token = localStorage.getItem('token');
    superUtil.getAuthenticatedRequest(token, 'api/authRequest', function(status, data) {
		if(status == 200 && data.authenticated == true){
			console.log('go to profile');
			window.location = '/profile';
			//localStorage.removeItem('token');
		}
    });
	
});