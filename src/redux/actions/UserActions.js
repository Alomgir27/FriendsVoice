import { USER_CHATLIST_STATE_CHANGE } from "../constants";
import { USER_MESSAGES_STATE_CHANGE } from "../constants";
import { USER_POSTS_STATE_CHANGE } from "../constants";
import { USER_STATE_CHANGE } from "../constants";
import { USER_CONNECTING_STATE_CHANGE } from "../constants";
import { USER_CONNECTED_STATE_CHANGE } from "../constants";
import { USER_CONNECTING_REQUESTS_STATE_CHANGE } from "../constants";
import { INITIATE_THEME } from "../constants";
import { CLEAR_DATA } from "../constants";
import { RELOAD_DATA_STATE_CHANGE } from "../constants";
import { USERS_POSTS_STATE_CHANGE } from "../constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from '../../../firebase';




export function clearData() {
    return ((dispatch) => {
        dispatch({ type: CLEAR_DATA });
    })
}

export function ReloadData() {
    return ((dispatch) => {
        dispatch({ type: RELOAD_DATA_STATE_CHANGE });
        dispatch(fetchUser());
        dispatch(fetchUserPosts());
        dispatch(fetchUserConnected());
        dispatch(fetchUserConnecting());
        dispatch(fetchUserConnectingRequests());
    })
}

export function fetchUser() {
    return (async(dispatch) => {
        const user = await AsyncStorage.getItem('user');
        if(user) {
            const { uid } = JSON.parse(user);
            firebase
                .firestore()
                .collection("users")
                .doc(uid)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const user = doc.data();
                        dispatch({ type: USER_STATE_CHANGE, currentUser: user });
                        dispatch({ type: INITIATE_THEME, payload: user.theme });
                    }
                })
                .catch((err) => {
                    dispatch({ type: RELOAD_DATA_STATE_CHANGE });
                });
        }
    })
}

export function fetchUserPosts() {
    return (async(dispatch) => {
        const user = await AsyncStorage.getItem('user');
        if(user) {
            const { uid } = JSON.parse(user);
        firebase.firestore()
            .collection('posts')
            .doc(uid)
            .collection('userPosts')
            .orderBy('timestamp', 'asc')
            .get()
            .then((snapshot) => {
                let posts = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                dispatch({ type: USER_POSTS_STATE_CHANGE, posts });

            })
        }
    })
}



export function fetchUserMessages(chatId) {
    return (async(dispatch) => {

        const user = await AsyncStorage.getItem('user');
        if(user) {
            const { uid } = JSON.parse(user);
        firebase.firestore()
            .collection('chats')
            .doc(chatId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                let messages = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                dispatch({ type: USER_MESSAGES_STATE_CHANGE, messages });
            })
        }
    })
}

export function fetchUserConnected() {
    return (async(dispatch) => {
        const user = await AsyncStorage.getItem('user');
        if(user) {
            const { uid } = JSON.parse(user);
        const unsubscribe = firebase.firestore()
            .collection('users')
            .doc(uid)
            .collection('connected')
            .onSnapshot((snapshot) => {
                let connected = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                dispatch({ type: USER_CONNECTED_STATE_CHANGE, connected });
                connected.forEach((item) => {
                    dispatch(fetchUserChatList(item.uid, item.user));
                })
            })
        return unsubscribe;
        }
    })
}

export function fetchUserConnecting() {
    return (async(dispatch) => {
        const user = await AsyncStorage.getItem('user');
        if(user) {
            const { uid } = JSON.parse(user);
        const unsubscribe = firebase.firestore()
            .collection('users')
            .doc(uid)
            .collection('connecting')
            .onSnapshot((snapshot) => {
                let connecting = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                dispatch({ type: USER_CONNECTING_STATE_CHANGE, connecting });

                connecting.forEach((item) => {
                    dispatch(fetchUsersPosts(item.id, item));
                })
            })
        return unsubscribe;
        }
    })
}

export function fetchUserConnectingRequests() {
    return (async(dispatch) => {
        const user = await AsyncStorage.getItem('user');
        if(user) {
            const { uid } = JSON.parse(user);
        const unsubscribe = firebase.firestore()
            .collection('users')
            .doc(uid)
            .collection('connectingRequests')
            .onSnapshot((snapshot) => {
                let connectingRequests = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data }
                })
                console.log(connectingRequests);
                dispatch({ type: USER_CONNECTING_REQUESTS_STATE_CHANGE, connectingRequests });
            })
        return unsubscribe;
        }
    })
}

export function fetchUsersPosts(uid, user) {
    return (async(dispatch) => {
        firebase.firestore()
            .collection('posts')
            .doc(uid)
            .collection('userPosts')
            .orderBy('timestamp', 'desc')
            .get()
            .then((snapshot) => {
        
                if(snapshot.docs.length > 0) {
                let posts = snapshot.docs.map(doc => {
                    let likes = [];
                    let comments = [];

                    firebase.firestore()
                        .collection('posts')
                        .doc(uid)
                        .collection('userPosts')
                        .doc(doc.id)
                        .collection('likes')
                        .get()
                        .then((snapshot) => {
                             snapshot.docs.map(doc => {
                                likes.push(doc.id);
                            })
                        })

                    firebase.firestore()
                        .collection('posts')
                        .doc(uid)
                        .collection('userPosts')
                        .doc(doc.id)
                        .collection('comments')
                        .get()
                        .then((snapshot) => {
                            snapshot.docs.map(doc => {
                                const data = {
                                    id: doc.id,
                                    ...doc.data()
                                }
                                comments.push(data);
                            })
                        })

                        comments.sort((a, b) => {
                            return a.timestamp - b.timestamp;
                        });


                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data, user : user.user, likes, comments }
                })
                dispatch({ type: USERS_POSTS_STATE_CHANGE, posts });
              }
            })
    })
}

export function fetchUserChatList(uid1, User) {
    return (async (dispatch) => {
        const user = await AsyncStorage.getItem('user');
        if(user) {
            const { uid } = JSON.parse(user);
            const uuid = [uid, uid1].sort().join('');
            firebase.firestore()
                .collection('chats')
                .doc(uuid)
                .get()
                .then((snapshot) => {
                    if(snapshot.exists) {
                        let chatList = snapshot.data();
                        chatList.user = User;

                        dispatch({ type: USER_CHATLIST_STATE_CHANGE, chatList });
                    }
                })
      
        }
    })
}