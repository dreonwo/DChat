
window.onload = ()=>{

    const $ = document.querySelector.bind(document);

    const loginDiv = $('#loginDiv');
    const signupDiv = $('#signupDiv');

    const signupA = $('#loginDiv p a');
    const loginA = $('#signupDiv p a');

    signupA.addEventListener('click', ()=>{
        signupDiv.style.display = 'block';
        loginDiv.style.display = 'none';
    });

    loginA.addEventListener('click', ()=>{
        signupDiv.style.display = 'none';
        loginDiv.style.display = 'block';
    });

    $('#btnLogin').addEventListener('click', () =>{
        login($('#loginEmail').value, $('#loginPassword').value);
        $('#loginEmail').value='';
        $('#loginPassword').value='';
    });
    
    $('#btnSignup').addEventListener('click', () =>{
        signup($('#signupEmail').value,$('#signupPassword').value);
        $('#signupEmail').value='';
        $('#signupPassword').value='';
    });

    $('#btnLogout').addEventListener('click', () =>{
        $('#homePage').style.display = 'none';
        $('#signupDiv').style.display = 'none';
        $('#main').style.display = 'block';
        logout();
    });

    onLogin(async user =>{
        if(user){
            let username = await getUsername(user.uid);
            if(!username){
                if($('#signupUsername').value){
                    addUsername(user.uid, $('#signupUsername').value);
                    $('#homePage').style.display = 'block';
                    $('#main').style.display = 'none';
                    $('#signupUsername').value='';
                }
                else{
                    //Todo: Add form to add username
                    $('#usernameDiv').style.display = 'block';
                    $('#username').addEventListener('submit', (e) =>{
                        e.preventDefault();
                        addUsername(user.uid, $('#username').value);
                        $('#username').value = '';
                        $('#homePage').style.display = 'block';
                        $('#accountDiv').style.display = 'none';
                        $('#usernameDiv').style.display = 'none';
                    });
                }
                
            }
            else{
                console.log(username)
                $('#homePage').style.display = 'block';
                $('#main').style.display = 'none';
            }

        }else{
            loginDiv.style.display = 'block';
        }
    
    });

};