'use strict'
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } 
from  "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";

import { getFirestore, collection, addDoc, getDoc, getDocs, updateDoc, deleteField, serverTimestamp, setDoc, doc, query, where, orderBy, onSnapshot, limit} 
from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmjzxWY2_7MDAnzB3hV0Wi98PIfp94R1E",
    authDomain: "dchat-f88d1.firebaseapp.com",
    projectId: "dchat-f88d1",
    storageBucket: "dchat-f88d1.appspot.com",
    messagingSenderId: "42289284703",
    appId: "1:42289284703:web:4af8e820dadc926a67bdea"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();

const db = getFirestore(app);

window.login = (email,password) =>{
    signInWithEmailAndPassword(auth, email,password)
    .catch( err => console.log(err.message));
}

window.signup = (email, password) =>{
    createUserWithEmailAndPassword(auth, email, password)
    .catch(err => console.log(err.message));
}

window.logout = () =>{
    auth.signOut();
}

window.getUser = async (userId)=>{
    console.log("UserId: ",userId)
    const docSnap = await getDoc(doc(db,'Users', userId));
    console.log("UserData: ",docSnap.data())
    if(docSnap.exists()) return docSnap.data();
}

window.getUserDoc = async (username)=>{

    const q = query(collection(db, "Users"), where("username", "==", username));
    const docSnap = await getDocs(q);
    var docRef;

    docSnap.forEach((doc) => {
        docRef = doc;
        
      });
    return docRef.data();
}

window.getUserRef = async (username)=>{

    const q = query(collection(db, "Users"), where("username", "==", username));
    const docSnap = await getDocs(q);
    var docRef;

    docSnap.forEach((doc) => {
        docRef = doc.ref;
      });
    return docRef;
}

window.getOwnDoc = async()=>{
    var ref = await doc(db,'Users', auth.currentUser.uid);
    var docu = await getDoc(ref);
    return docu.data();
}

window.getOwnRef = async()=>{
    return doc(db,'Users', auth.currentUser.uid);
}

window.addUsername = (userId, username)=>{
    console.log("Username in addUsername: ",username,userId)
    setDoc(doc(db,'Users',userId),{username, chats:{} });
}

window.createChatRoom = async (user1Prom,user2Prom)=>{
    var user1 = await user1Prom;
    var user2 = await user2Prom;
    var user1Ref = await getOwnRef();
    var user2Ref = await getUserRef(user2.username);
    var chatId

    if(!Object.values(user1.chats).includes(user2.username) && !Object.values(user2.chats).includes(user1.username)){

        chatId = (await addDoc( collection(db, 'Chats'), {messages: [] })).id;

        updateDoc(user1Ref,{[`chats.${chatId}`]: user2.username});
        updateDoc(user2Ref,{[`chats.${chatId}`]: user1.username});
    }
    else if(Object.values(user1.chats).includes(user2.username) && !Object.values(user2.chats).includes(user1.username)){
        let id = Object.keys(user1.chats).find(key => user1.chats[key] === user2.username);
        updateDoc(user2Ref,{[`chats.${id}`]: user1.username});
    }
    else{
        let id = Object.keys(user2.chats).find(key => user2.chats[key] === user1.username);
        updateDoc(user1Ref,{[`chats.${id}`]: user2.username});
    }
}

window.deleteChat = async (username)=>{
    var myRef = await getOwnRef();
    var my = await getOwnDoc();
    var chatId = await getChatId(username);
    console.log('chatId: '+chatId)
    await updateDoc(myRef, {
        [`chats.${chatId}`]: deleteField()
    });
}

window.getChatId = async(username)=>{
    var my = await getOwnDoc();
    return Object.keys(my.chats).find(key => my.chats[key] === username);
}

window.createMessage = async (username, message)=>{
    var id = await getChatId(username);
    var my = await getOwnDoc();
    var server = serverTimestamp();
    addDoc(collection(db,'Chats',id, 'messages'),{
        timestamp:server,
        message,
        sender:my.username
    });
}

window.getAllMessages = async (chatId,func)=>{

    const q = query(collection(db,"Chats",chatId,"messages"), orderBy("timestamp"));
    const docSnap = await getDocs(q);

    docSnap.forEach((doc)=>{
        window.latestTimestamp = doc.data().timestamp;
        func(doc);
    });
}

window.startListeningForLatestMessage = function(chatId, f){
    window.stopListeningForLatestMessage = onSnapshot(
        query(collection(db,"Chats",chatId,"messages"), where("timestamp", ">", window.latestTimestamp), orderBy("timestamp","desc"), limit(1)),
        docs => {docs.forEach(f)}
    );
}

window.onLogin = (f) =>{
    onAuthStateChanged(auth, user=>{
            f(user);
    });
}