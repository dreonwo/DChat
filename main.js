
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

    $('#backbtn').addEventListener('click', () =>{
        $('#chatroom').style.display = 'none';
        $('#scroll').style.display = 'block';
    });


    $('#searchbox').addEventListener('keyup', (e)=>{
        
        if (e.key === 'Enter' || e.keyCode === 13) {
            createChatRoom(getOwnDoc(),getUserDoc(e.target.value));
            e.target.value = '';
        }
    });

    $('#messagebox').addEventListener('keyup', (e)=>{
        
        if (e.key === 'Enter' || e.keyCode === 13) {
            
            createMessage(e.currentTarget.parentNode.querySelector('#name').textContent, e.target.value);
            e.target.value = '';
        }
    });

    var createChatterDiv = (chatter)=>{
        var chatId;
        chatterDiv = document.createElement('div');
        chatterDiv.classList.add('chatDiv');
        chatterDiv.textContent = chatter;
        var parser = new DOMParser();
        var doc = parser.parseFromString(`<i class="fas fa-trash"></i>`, 'text/html');
        var trash = doc.body;

        trash.style.display = 'inline-block';
        trash.style.position = 'relative';
        trash.style.background = 'none';
        trash.style.left = '43%';

        trash.addEventListener('click', (e)=>{
            deleteChat(e.currentTarget.parentNode.textContent);
            e.stopPropagation();
        });

        chatterDiv.append(trash);
        chatterDiv.addEventListener('click',(e)=>{
            $('#scroll').style.display = 'none';
            $('#chatroom').style.display = 'block';
            $('h2#name').textContent = e.target.textContent;
        });
        $('#chats').appendChild(chatterDiv);
    }

    onLogin(async auth =>{
        if(auth){
            try{
                window.user = await getUser(auth.uid);
            }
            catch{
                logout();
            }

            if(user){
                let username = window.user.username;
                if(!username){
                    if($('#signupUsername').value){
                        addUsername(auth.uid, $('#signupUsername').value);
                        $('#homePage').style.display = 'block';
                        $('#main').style.display = 'none';
                        $('#signupUsername').value='';
                    }
                    else{
                        //Todo: Add form to add username
                        $('#usernameDiv').style.display = 'block';
                        $('#username').addEventListener('submit', (e) =>{
                            e.preventDefault();
                            addUsername(auth.uid, $('#username').value);
                            $('#username').value = '';
                            $('#homePage').style.display = 'block';
                            $('#accountDiv').style.display = 'none';
                            $('#usernameDiv').style.display = 'none';
                        });
                    }
                    
                }
                else{
                    //console.log(window.user)
                    $('#chats').innerHTML = '';
    
                    $('#homepage h2').textContent = window.user.username;
    
                    for(var chatter in user.chats){
                        createChatterDiv(user.chats[chatter]);
                    }

                    $('#homePage').style.display = 'block';
                    $('#main').style.display = 'none';
                }
    
            }
        }
        else{
            loginDiv.style.display = 'block';
        }               
    });
};