import React, { useState, useEffect, useCallback } from 'react'
import {TextInput, View, Text, StyleSheet, Image, TouchableOpacity,  ActivityIndicator, useWindowDimensions, Dimensions, FlatList, ScrollView } from 'react-native'

import { MaterialCommunityIcons, FontAwesome } from 'react-native-vector-icons';
import { Caption, Title } from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';


import { Video } from 'expo-av';

import { connect } from 'react-redux';

import firebase from '../../../../../firebase'

function Profile(props) {
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userConnecting, setUserConnecting] = useState([]);
    const [userConnected, setUserConnected] = useState([]);
    const [videosPosts, setVideosPosts] = useState([]);
    const [imagesPosts, setImagesPosts] = useState([]);
    const [backgroundColor, setBackgroundColor] = useState('#fff');
    const [textColor, setTextColor] = useState('#000');
    const [theme, setTheme] = useState('light');
    const [tab, setTab] = useState(0);
    const [isState, setIsState] = useState(0);
   

    useEffect(() => {
       if(props.route.params.uid === props.User.currentUser.uid) {
            firebase.firestore()
            .collection('users')
            .doc(props.User.currentUser.uid)
            .onSnapshot((snapshot) => {
                setUser(snapshot.data())
            })
            const videos = props.User.posts?.filter((post) => post.type === 'video');
            const images = props.User.posts?.filter((post) => post.type === 'image');
            console.log(videos, images);
            setVideosPosts(videos);
            setImagesPosts(images);
            setUserConnecting(props.User.connecting);
            setUserConnected(props.User.connected);
        } else {
            const user = props.Users.users?.find(el => el.uid === props.route.params.uid);
            const posts = props.Users.posts?.filter(el => el.user.uid === props.route.params.uid);
            const connecting = props.User.connecting?.filter(el => el.uid === props.route.params.uid);
            const connected = props.User.connected?.filter(el => el.uid === props.route.params.uid);
            if(connected.length > 0) {
                setIsState(2);
            } else if(connecting.length > 0) {
                setIsState(1);
            } else {
                setIsState(0);
            }
            if(user === undefined) {
                firebase.firestore()
                .collection('users')
                .doc(props.route.params.uid)
                .get()
                .then((documentSnapshot) => {
                    if(documentSnapshot.exists) {
                        setUser(documentSnapshot.data());
                    }
                })

                firebase.firestore()
                .collection('posts')
                .doc(props.route.params.uid)
                .collection('userPosts')
                .orderBy('timestamp', 'asc')
                .get()
                .then((snapshot) => {
                    let posts = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    setVideosPosts(posts.filter((post) => post.type === 'video'));
                    setImagesPosts(posts.filter((post) => post.type === 'image'));
                })

                firebase.firestore()
                .collection('connecting')
                .doc(props.route.params.uid)
                .collection('userConnecting')
                .get()
                .then((snapshot) => {
                    let connecting = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    setUserConnecting(connecting);
                })

                firebase.firestore()
                .collection('connected')
                .doc(props.route.params.uid)
                .collection('userConnected')
                .get()
                .then((snapshot) => {
                    let connected = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data }
                    })
                    setUserConnected(connected);
                })


            } else {
                setUser(user);
                const videos = posts?.filter((post) => post.type === 'video');
                const images = posts?.filter((post) => post.type === 'image');
                setVideosPosts(videos);
                setImagesPosts(images);
                setUserConnecting(connecting);
                setUserConnected(connected);
            }
        }
    }, [props.route.params.uid, props.User.currentUser, props.User.users, props.User.posts, props.User.connecting, props.User.connected]);


    useEffect(() => {
        console.log(imagesPosts)
        console.log(videosPosts)
    }, [imagesPosts, videosPosts])
   


    useEffect(() => {
        if(props.route.params.uid === props.User.currentUser.uid) {
            const user = {
                name : props.User.currentUser.name,
                photoURL : props.User.currentUser.photoURL,
                uid : props.User.currentUser.uid,
                token : props.User.currentUser?.token,
            }
            setVideosPosts(prev => {
                return prev.map((post) => {
                    let likes = [];
                    let comments = [];
                    firebase.firestore()
                    .collection('posts')
                    .doc(props.User.currentUser.uid)
                    .collection('userPosts')
                    .doc(post.id)
                    .collection('likes')
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.map(doc => {
                            likes.push(doc.id);
                        })
                    })
                    firebase.firestore()
                    .collection('posts')
                    .doc(props.User.currentUser.uid)
                    .collection('userPosts')
                    .doc(post.id)
                    .collection('comments')
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.map(doc => {
                            comments.push(doc.data());
                        })
                    })

                    return {
                        ...post,
                        user,
                        likes,
                        comments,
                    }
                })
            })

            setImagesPosts(prev => {
                return prev.map((post) => {
                    let likes = [];
                    let comments = [];
                    firebase.firestore()
                    .collection('posts')
                    .doc(props.User.currentUser.uid)
                    .collection('userPosts')
                    .doc(post.id)
                    .collection('likes')
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.map(doc => {
                            likes.push(doc.id);
                        })
                    })
                    firebase.firestore()
                    .collection('posts')
                    .doc(props.User.currentUser.uid)
                    .collection('userPosts')
                    .doc(post.id)
                    .collection('comments')
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.map(doc => {
                            comments.push(doc.data());
                        })
                    })

                    return {
                        ...post,
                        user,
                        likes,
                        comments,
                    }
                })
            })
        } else {
            const user = {
                name : props.route.params.user.name,
                photoURL : props.route.params.user.photoURL,
                uid : props.route.params.user.uid,
                token : props.route.params.user?.token,
            }
            setVideosPosts(prev => {
                return prev.map((post) => {
                    let likes = [];
                    let comments = [];
                    firebase.firestore()
                    .collection('posts')
                    .doc(props.route.params.uid)
                    .collection('userPosts')
                    .doc(post.id)
                    .collection('likes')
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.map(doc => {
                            likes.push(doc.id);
                        })
                    })
                    firebase.firestore()
                    .collection('posts')
                    .doc(props.route.params.uid)
                    .collection('userPosts')
                    .doc(post.id)
                    .collection('comments')
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.map(doc => {
                            comments.push(doc.data());
                        })
                    })

                    return {
                        ...post,
                        user,
                        likes,
                        comments,
                    }
                })
            })
            setImagesPosts(prev => {
                return prev.map((post) => {
                    let likes = [];
                    let comments = [];
                    firebase.firestore()
                    .collection('posts')
                    .doc(props.route.params.uid)
                    .collection('userPosts')
                    .doc(post.id)
                    .collection('likes')
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.map(doc => {
                            likes.push(doc.id);
                        })
                    })
                    firebase.firestore()
                    .collection('posts')
                    .doc(props.route.params.uid)
                    .collection('userPosts')
                    .doc(post.id)
                    .collection('comments')
                    .get()
                    .then((snapshot) => {
                        snapshot.docs.map(doc => {
                            comments.push(doc.data());
                        })
                    })

                    return {
                        ...post,
                        user,
                        likes,
                        comments,
                    }
                })
            })

        }
    }, [props.route.params.uid, props.User.currentUser, props.User.users, props.User.posts, props.User.connecting, props.User.connected]);

    useEffect(() => {
        setBackgroundColor(props.UI.backgroundColor);
        setTextColor(props.UI.textColor);
        setTheme(props.UI.theme);
    }, [props.UI.backgroundColor, props.UI.textColor, props.UI.theme]);

    const FirstRoute = useCallback(() => (
              <View style={{ flex: 1, backgroundColor: backgroundColor }}>
                <FlatList
                    data={imagesPosts}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={{ flex: 1/3}}
                        onPress={() => props.navigation.navigate('PostDetails', { post: item, setPosts: setImagesPosts })}
                        >
                            <Image
                                source={{ uri: item.remoteUri }}
                                style={{ flex: 1, aspectRatio: 1/1 }}
                            />
                        </TouchableOpacity>
                    )}
                    //Setting the number of column
                    numColumns={3}
                    keyExtractor={(item, index) => 'A' + index.toString()}
                    listKey={(item, index) => 'A' + index.toString()}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>
    ), [imagesPosts, backgroundColor]);

    

    

    const SecondRoute = useCallback(() => (
        <View style={{ flex: 1, backgroundColor: backgroundColor }}>
            <FlatList
                data={videosPosts}
                renderItem={({ item }) => (
                    <TouchableOpacity style={{ flex: 1 / 3}} onPress={() => props.navigation.navigate('PostDetails', { post: item, setPosts : setVideosPosts })}>
                        <Video
                            source={{ uri: item.remoteUri }}
                            rate={1.0}
                            volume={1.0}
                            isMuted={false}
                            resizeMode="cover"
                            isLooping
                            useNativeControls
                            style={{ flex: 1, aspectRatio: 1/1 }}
                        />
                    </TouchableOpacity>
                )}
                //Setting the number of column
                numColumns={3}
                keyExtractor={(item, index) => 'B' + index.toString()}
                listKey={(item, index) => 'B' + index.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
            />
        </View>
    ), [videosPosts, backgroundColor]);

    const renderScene = useCallback(() => {
        switch(tab) {
            case 0:
                return FirstRoute();
            case 1:
                return SecondRoute();
            default:
                return FirstRoute();
        }
    }, [tab, imagesPosts, videosPosts, backgroundColor]);


    const sendNotification = (token) => { 
        const message = {
            to: token,
            sound: 'default',
            title: 'New Connection',
            body: `${props.User.currentUser.name} wants to connect with you`,
            data: { data: 'goes here' },
            _displayInForeground: true,
        };
        fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    }




    const handleToggle = () => {
        if(isState === 0) {
            setIsState(1);
            firebase.firestore()
            .collection('users')
            .doc(props.User.currentUser.uid)
            .collection('connecting')
            .doc(props.route.params.uid)
            .set({
                uid: props.route.params.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                user: {
                    name : props.route.params.user?.name || "",
                    photoURL: props.route.params.user?.photoURL || "",
                    userName: props.route.params.user?.userName || "",
                    uid: props.route.params.user?.uid || "",
                    token: props.route.params.user?.token || "",
                }
            })
            .then(() => {
                firebase.firestore()
                .collection('users')
                .doc(props.route.params.uid)
                .collection('connectingRequests')
                .doc(props.User.currentUser.uid)
                .set({
                    uid: props.User.currentUser.uid,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    user: {
                        name : props.User.currentUser?.name || "",
                        photoURL: props.User.currentUser?.photoURL || "",
                        userName: props.User.currentUser?.userName || "",
                        uid: props.User.currentUser?.uid || "",
                        token: props.User.currentUser?.token || "",
                    }
                })

                if(props.route.params.user?.token) {
                    sendNotification(props.route.params.user.token);
                }
            })

        } else if(isState === 1) {
            setIsState(0);
            firebase.firestore()
            .collection('users')
            .doc(props.User.currentUser.uid)
            .collection('connecting')
            .doc(props.route.params.uid)
            .delete()

            firebase.firestore()
            .collection('users')
            .doc(props.route.params.uid)
            .collection('connectingRequests')
            .doc(props.User.currentUser.uid)
            .delete()

        } 
    };

    const handleConnectedDisConnect = () => {
        setIsState(0);
        firebase.firestore()
        .collection('users')
        .doc(props.User.currentUser.uid)
        .collection('connected')
        .doc(props.route.params.uid)
        .delete()

        firebase.firestore()
        .collection('users')
        .doc(props.route.params.uid)
        .collection('connected')
        .doc(props.User.currentUser.uid)
        .delete()

    };


    const ButtonTabScene = useCallback(() => {
            if(props.route.params.uid === props.User.currentUser.uid) {
                return (
                    <TouchableOpacity style={styles.containerForEditProfileButton} onPress={() => props.navigation.navigate('ShareProfile')}>
                     <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Share Profile</Text>
                  </TouchableOpacity>
                )
            } else {
                if(isState === 0) {
                    return (
                        <TouchableOpacity style={styles.containerForEditProfileButton} onPress={handleToggle}>
                            <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Connect</Text>
                        </TouchableOpacity>
                    )
                } else if(isState === 1) {
                    return (
                        <TouchableOpacity style={styles.containerForEditProfileButton} onPress={handleToggle}>
                            <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Connecting</Text>
                        </TouchableOpacity>
                    )
                } else if(isState === 2) {
                    return (
                        <TouchableOpacity style={styles.containerForEditProfileButton} onPress={handleConnectedDisConnect}>
                            <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Connected</Text>
                        </TouchableOpacity>
                    )
                }
            }
    }, [isState, textColor, props.route.params.uid, props.User.currentUser.uid]);


        
   
    const FirstView = () => {
        return (
            <View style={{  flex: 1 }}>
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Image style={styles.avatarBackground}
                                source={{ uri: user.imageBackground ? user.imageBackground : 'https://img.freepik.com/free-photo/beautiful-shot-tree-savanna-plains-with-blue-sky_181624-21992.jpg?w=996&t=st=1662952524~exp=1662953124~hmac=a2591cd4eb748aaf051fbd8c2d16dfaf696edea2ca156708b213fa0ed60608b7' }} />
                            <TouchableOpacity style={styles.headerButtonLeft} onPress={() => props.navigation.goBack()}>
                                <MaterialCommunityIcons name="arrow-left" size={30} color={textColor} />
                            </TouchableOpacity>
                            <Image 
                              style={styles.avatar}
                              source={{ uri: user.photoURL ? user.photoURL : 'https://www.shareicon.net/data/512x512/2016/05/24/770117_people_512x512.png' }}
                           />
                        </View>
                    </View>
                    <View style={styles.bodyContainer}>
                       <View style={styles.body}>
                            <View style={styles.bodyContent}>
                                <Text style={{ 
                                    fontSize: 18, 
                                    color: textColor,
                                    fontFamily: 'sans-serif-medium',
                                    textTransform: 'capitalize',
                                    marginLeft: 10,

                                    }}>{user.name}</Text>
                                <Text style={{ 
                                    fontSize: 14,
                                    color: textColor,
                                    fontFamily: 'Grape-Drink',
                                    }}>{user.userName ? "@" : ""}{user.userName}
                                    </Text>
                            </View>
                        <View style={styles.BioAndLocationAndOthers}>
                            <View style={styles.bio}>
                                <Text style={{ fontSize: 12, color: textColor, }}>{user.bio}</Text>
                            </View>
                            <View style={styles.location}>
                                <Text style={{ fontSize: 12, color: textColor }}>{user.location}</Text>
                          </View>
                       </View>
                    </View>
                 </View>
                    
                    <View style={styles.containerBottomInformation}>
                        <View style={styles.containerBottom}>
                           <TouchableOpacity style={styles.containerBottomButton}>
                                <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>{videosPosts.length + imagesPosts.length}</Text>
                                <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Posts</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.containerBottomButton}>
                                <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>{userConnecting.length}</Text>
                                <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Connecting</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.containerBottomButton}>
                                <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>{userConnected.length}</Text>
                                <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Connected</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.containerForMessagesAndEditProfile}>
                    <View style={styles.containerForMessages}>
                       {props.route.params?.uid === props.User.currentUser.uid ? (
                           <TouchableOpacity style={styles.containerForMessagesButton} onPress={() => props.navigation.navigate('EditProfile')}>
                                 <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Edit Profile</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity style={styles.containerForMessagesButton} onPress={() => props.navigation.navigate('Messages')}>
                                    <Text style={{ color: textColor,  fontFamily: 'Grape-Drink', }}>Message</Text>
                            </TouchableOpacity>
                            )}
                    </View>
                    <View style={styles.containerForEditProfile}>
                       {ButtonTabScene()}
                    </View>
                  </View>
            </View>
        )
    }

   

    const SecondView = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.containerForTabBar}>
                    <View style={[
                        styles.containerLeftTab,
                         { 
                            borderBottomColor :  textColor,
                            borderBottomWidth: tab === 0 ? 3 : 0,
                            opacity: tab === 0 ? 1 : 0.5,
                        }]}
                        >
                        <TouchableOpacity style={styles.containerForTabBarButtons} onPress={() => setTab(0)}>
                            <MaterialCommunityIcons name="grid" size={30} color={textColor} />
                        </TouchableOpacity>
                    </View>
                    <View style={[
                        styles.containerRightTab,
                          { 
                            borderBottomColor :  textColor,
                            borderBottomWidth: tab === 1 ? 3 : 0,
                            opacity: tab === 1 ? 1 : 0.5,
                        
                        }]}>
                        <TouchableOpacity style={styles.containerForTabBarButtons} onPress={() => setTab(1)}>
                            <MaterialCommunityIcons name="view-grid-outline" size={30} color={textColor} />
                        </TouchableOpacity>
                    </View>
                 </View>
                 {renderScene()}
            </View>
        )
    }
    
    const data = [
        {
            component: FirstView,
        },
        {
            component: SecondView,
        },
    ];


  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor }}>
        {user === null ? (
            <ActivityIndicator />
        ) : (
            
            <FlatList
                data={data}
                renderItem={({ item }) => <item.component />}
                listKey={(item, index) => index.toString()}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
            />
        )}
       
    </View>
  );
}

const styles = StyleSheet.create({
    
    containerTopRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    imageProfile: {
        width: 80,
        height: 80,
        borderRadius: 50,
        marginBottom: 10,
    },
    containerBottomInformation: {
        marginBottom: 10,
    },
    containerBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 20,
    },
    containerBottomButton: {
        alignItems: 'center',
    },
    containerBottomButtonText: {
        fontWeight: 'bold',
    },
    containerTabBar: {
        flex: 1,
    },
    containerForMessagesAndEditProfile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: 10,
    },
    containerForMessages: {
        flex: 1,
        marginRight: 3,
    },
    containerForMessagesButton: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        textTransform: 'uppercase',
        borderWidth: 1,
    },
    containerForMessagesButtonText: {
        fontWeight: 'bold',
    },
    containerForEditProfile: {
        flex: 1,
        marginLeft: 3,
    },
    containerForEditProfileButton: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        textTransform: 'uppercase',
    },
    containerForEditProfileButtonText: {
        fontWeight: 'bold',
    },
    header:{
        height:200,
    },
    headerContent:{
        flex: 1,

    },
    headerButtonLeft: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'absolute',
        left: 10,
        top: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: "white",
        marginBottom:10,
        position: 'absolute',
        marginTop:50,
        marginLeft: 20,

    },
    avatarBackground: {
        width: Dimensions.get('window').width,
        height: 100,
        resizeMode: 'cover',
    },
    body:{
        // alignItems:'left',
        // justifyContent: 'left',

    },
    bodyContent: {
        alignContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginLeft: -30,

    },
    bodyContainer: {
        // flex: 1,
        marginTop: -100,
        marginHorizontal: 20,
        height: 120,
    },
    BioAndLocationAndOthers : {
        // flex: 1,
        // justifyContent: 'left',
        // alignItems: 'left',
        // marginLeft: -100,
        marginTop: 40,
        opacity: 0.8,

    },
    bio: {
        fontSize: 16,
        fontFamily: 'Grape-Drink',
    },
    location: {
        fontSize: 16,
        fontFamily: 'Grape-Drink',
    },
    others: {
        fontSize: 16,
        fontFamily: 'Grape-Drink',
    },
    containerForTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    containerForTabBarButtons: {
        alignItems: 'center',
    },
    containerForTabBarButtonText: {
        fontWeight: 'bold',
    },
    containerLeftTab: {
        flex: 1,
        padding: 5,
       
    },
    containerRightTab: {
        flex: 1,
        padding: 5,
    },
   
   

   
});

    
const mapStateToProps = (store) => ({
  User: store.User,
  Users: store.Users,
  UI: store.UI
})

export default connect(mapStateToProps)(Profile)
