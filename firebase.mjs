// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } 
from  "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";

import { getFirestore, collection, addDoc, getDoc, getDocs, serverTimestamp, setDoc, doc} 
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

window.getUsername = async (userId)=>{
    const docSnap = await getDoc(doc(db,'Users', userId));
    if(docSnap.exists()) return docSnap.data().username;
}

window.addUsername = (userId, username)=>{
    setDoc(doc(db,'Users',userId),{username});
}

window.onLogin = (f) =>{
    onAuthStateChanged(auth, user=>{
            f(user);
    });
}