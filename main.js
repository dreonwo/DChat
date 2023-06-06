'use strict'

window.onload = ()=>{

    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    
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

    $('#scroll').addEventListener('click',(e)=>{
        $('.searchResults').style.display = 'none';
    });
    
    $('#btnSignup').addEventListener('click', () =>{
        signup($('#signupEmail').value,$('#signupPassword').value);
        $('#signupEmail').value='';
        $('#signupPassword').value='';
    });

    $('#btnLogout').addEventListener('click', () =>{
        $('.logout-confirmation-wrapper').style.display = 'flex';
    });

    $('.logout-confirmation-wrapper').addEventListener('click',() =>{
        $('.logout-confirmation-wrapper').style.display = 'none';
    });

    $('.logout-confirmation-yes').addEventListener('click',() =>{
        $('#homePage').style.display = 'none';
        $('#signupDiv').style.display = 'none';
        $('#landingPage').style.display = 'none';
        $('#main').style.display = 'block';
        window.user = undefined;
        logout();
    });

    $('.logout-confirmation-no').addEventListener('click',() =>{
        $('.logout-confirmation-wrapper').style.display = 'none';
    });

    $('#backbtn').addEventListener('click', () =>{
        $('#chatroom').style.transform = 'scale(0) translate(-50%,-50%)';
        $('#landingPage').style.display = 'none';
        $('#scroll').style.display = 'block';
        $('#messages').innerHTML = '';
        stopListeningForLatestMessage();
    });

    $('#searchbox').addEventListener('keyup', async (e)=>{
        $('.searchResults').innerHTML = '';
        let usernames = await getAllUsernames();

        if(e.target.value.trim()){

            let pattern = '^' + e.target.value;
            let match = new RegExp(pattern,'i');
            let count = 0;
            let filteredNames = usernames.filter(name =>{
                let isMatch = false;
                if(match.test(name)){
                    isMatch = true;
                    count++;
                }
                return isMatch && name != user.username && (count <= 5);
            });
            console.log(filteredNames)
            if(filteredNames.length > 0){
                $('.searchResults').style.display = 'flex';

                filteredNames.forEach(name =>{
                    let p = document.createElement('p');
                    p.style.margin = 0;
                    p.textContent = name;
                    p.style.cursor = 'pointer';

                    p.addEventListener('click',(e)=>{
                        createChatRoom(user, getUserDoc(e.target.textContent)).then(()=>{
                            createChatterDiv(e.target.textContent);
                            $('#searchbox').value = '';
                        });

                        $('.searchResults').style.display = 'none';
                    });

                    $('.searchResults').appendChild(p);
                });
                
            }
            else{
                $('.searchResults').style.display = 'none'; 
            }
        }
        else{
            $('.searchResults').style.display = 'none';
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
        let isDupe = false;

        $$('.chatDiv').forEach((div)=>{
            if(div.textContent == chatter){
                isDupe = true;
            }
        });

        if(!isDupe){
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
                $('#chatroom').style.transform = "scale(100%) translate(-50%,-50%)";
                $('#name').textContent = e.target.textContent;
    
                getAllMessages(chatId, addMsgDiv).then(()=>{
    
                    $('#messages').scrollTop = $('#messages').scrollHeight;
    
                    startListeningForLatestMessage(chatId,addMsgDiv);
                });
     
            });
    
            $('#chats').appendChild(chatterDiv);
        }
    }

    const addMsgDiv = (doc)=>{

        let data = doc.data();

        if(data.timestamp){
            let msgDiv = $('#messages').appendChild(document.createElement('div'));
            let senderSpan = msgDiv.appendChild(document.createElement('div'));
            let msgSpan = msgDiv.appendChild(document.createElement('div'));
            let timeSpan = msgDiv.appendChild(document.createElement('span'));

            msgSpan.textContent = data.message;
            msgSpan.classList.add('message');
    
            if(data.sender == user.username)
                msgDiv.classList.add('myMsg');
            else
                msgDiv.classList.add('theirMsg');
    
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
                $('#homePage h2').textContent = window.user.username;

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