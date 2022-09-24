import  firebase from 'firebase/compat';
import 'firebase/compat/firestore';
import 'firebase/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';


    
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};
  

if(firebase.apps.length === 0){
    firebase.initializeApp(firebaseConfig);
}

export default firebase;

