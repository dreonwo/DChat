'use strict'

window.onload = ()=>{

    const $ = document.querySelector.bind(document);
    
    const landingPage = $('#landingPage');

    landingPage.style.display = "block";

    const loginDiv = $('#loginDiv');
    const signupDiv = $('#signupDiv');

    const signupA = $('#loginDiv p a');
    const loginA = $('#signupDiv p a');
    const landingBtn = $('#landingBtn');
    const goHomes = document.querySelectorAll('.goHome');
    
    goHomes.forEach(goHome =>{
        goHome.addEventListener('click', ()=>{
            landingPage.style.display = 'block';
            $('#main').style.display = 'none';
        });
    });

    landingBtn.addEventListener('click', () =>{
        landingPage.style.display = 'none';
        $('#main').style.display = 'block';
    });

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
        $('#landingPage').style.display = 'none';
        $('#main').style.display = 'block';
        window.user = undefined;
        logout();
    });

    $('#backbtn').addEventListener('click', () =>{
        $('#chatroom').style.display = 'none';
        $('#landingPage').style.display = 'none';
        $('#scroll').style.display = 'block';
        $('#messages').innerHTML = '';
        stopListeningForLatestMessage();
    });

    $('#searchbox').addEventListener('keyup', (e)=>{
        
        if (e.key === 'Enter' || e.keyCode === 13) {
            createChatRoom(user,getUserDoc(e.target.value)).then(()=>{
                createChatterDiv(e.target.value);
                e.target.value = '';
            });
        }
    });

    $('#messagebox').addEventListener('keyup', (e)=>{
        
        if (e.key === 'Enter' || e.keyCode === 13) {
            
            createMessage(e.currentTarget.parentNode.querySelector('#name').textContent, e.target.value);
            e.target.value = '';
        }
    });

    $('#loginPassword').addEventListener('keyup', e =>{
        if (e.key === 'Enter' || e.keyCode === 13) {
            login($('#loginEmail').value, $('#loginPassword').value);
        $('#loginEmail').value='';
        $('#loginPassword').value='';
        }
    });

    var createChatterDiv = async (chatter)=>{
        var chatId = await getChatId(chatter);
        var chatterDiv = document.createElement('div');
        chatterDiv.classList.add('chatDiv');
        chatterDiv.textContent = chatter;

        var parser = new DOMParser();
        var doc = parser.parseFromString(`<i class="fas fa-trash trash trashMobile"></i>`, 'text/html');
        var trash = doc.querySelector('i');

        trash.addEventListener('click', (e)=>{
            deleteChat(e.currentTarget.parentNode.textContent).then(()=>{
                chatterDiv.remove();
            });
            e.stopPropagation();
        });

        chatterDiv.append(trash);
        chatterDiv.addEventListener('click',(e)=>{
            $('#scroll').style.display = 'none';
            $('#chatroom').style.display = 'block';
            $('h2#name').textContent = e.target.textContent;

            getAllMessages(chatId, addMsgDiv).then(()=>{

                $('#messages').scrollTop = $('#messages').scrollHeight;

                startListeningForLatestMessage(chatId,addMsgDiv);
                
            });
 
        });

        $('#chats').appendChild(chatterDiv);
    }

    const addMsgDiv = (doc)=>{

        let data = doc.data();

        if(data.timestamp){
            let msgDiv = $('#messages').appendChild(document.createElement('div'));
            let senderSpan = msgDiv.appendChild(document.createElement('span'));
            let msgSpan = msgDiv.appendChild(document.createElement('span'));
            let timeSpan = msgDiv.appendChild(document.createElement('span'));

            msgSpan.textContent = data.message;
    
            if(data.sender == user.username)
                senderSpan.classList.add('myMsg');
            else
                senderSpan.classList.add('theirMsg');
    
            senderSpan.textContent = data.sender;
            senderSpan.classList.add('sender');
    
            timeSpan.classList.add('time');
            timeSpan.textContent = ` ${new Date(data.timestamp.toDate()).toLocaleTimeString()}`;

            $('#messages').scrollTop = $('#messages').scrollHeight;
        }     

    }

    async function statusChange(auth){
        if(auth){
            try{
                window.user = await getUser(auth.uid);
            }
            catch(err){
                console.log(err)
            }

            if(!window.user){
                if($('#signupUsername').value){
                    await addUsername(auth.uid, $('#signupUsername').value);
                    $('#homePage').style.display = 'block';
                    $('#main').style.display = 'none';
                    $('#landingPage').style.display = 'none';
                    $('#signupUsername').value='';
                    statusChange(auth);
                }
                else{
                    $('#loginDiv').style.display = 'none';
                    $('#signupDiv').style.display = 'none';
                    $('#landingPage').style.display = 'none';
                    $('#usernameDiv').style.display = 'block';

                    $('#usernameForm').addEventListener('submit', async (e) =>{
                        e.preventDefault();
                        await addUsername(auth.uid, $('#username').value);
                        $('#username').value = '';
                        $('#homePage').style.display = 'block';
                        $('#accountDiv').style.display = 'none';
                        $('#usernameDiv').style.display = 'none';
                        $('#landingPage').style.dislay = 'none';
                        statusChange(auth);
                    });
                } 
            }
            else{
                $('#chats').innerHTML = '';

                $('#homepage h2').textContent = window.user.username;

                for(var chatter in user.chats){
                    createChatterDiv(user.chats[chatter]);
                }

                $('#homePage').style.display = 'block';
                $('#main').style.display = 'none';   
                $('#landingPage').style.display = 'none'; 
            }
        }
        else{
            loginDiv.style.display = 'block';
        }               
    };
    onLogin(statusChange);
};