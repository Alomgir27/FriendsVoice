import  firebase from 'firebase/compat';
import 'firebase/compat/firestore';
import 'firebase/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';


    
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBKVon02Kd4Wp-X7pqVE1eBJ2xqJJZEB1E",
    authDomain: "friendsvoice-83a55.firebaseapp.com",
    projectId: "friendsvoice-83a55",
    storageBucket: "friendsvoice-83a55.appspot.com",
    messagingSenderId: "585705831310",
    appId: "1:585705831310:web:3c7adcdfe790f830cbc2df",
    measurementId: "G-D5ZG791WLG"
};
  

if(firebase.apps.length === 0){
    firebase.initializeApp(firebaseConfig);
}

export default firebase;

