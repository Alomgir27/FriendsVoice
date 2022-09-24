import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef, useCallback, Component, memo } from 'react';
import {
   Text,
   View,
   Button,
   Platform,
   FlatList,
   StyleSheet, 
   TextInput, 
   Image, 
   useWindowDimensions, 
   TouchableOpacity,
   KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingViewBase,
    ScrollView,
    SafeAreaView,
    ImageBackground,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    Animated,
    Easing,
    Alert,
    Modal,
  } from 'react-native';

import { MaterialCommunityIcons, Ionicons } from 'react-native-vector-icons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';

import firebase from '../../../../firebase';

import { connect } from 'react-redux';
import moment from 'moment/moment';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function MyConnect(props) {
  const layout = useWindowDimensions();

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState([]);
  const [connectingRequests, setConnectingRequests] = useState([]);
  const [connected, setConnected] = useState([]);
  const [connections, setConnections] = useState([]);
  const [user, setUser] = useState([]);
  const [searchUser, setSearchUser] = useState([]);
  const [allRelationships, setAllRelationships] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const [index, setIndex] = useState(0);

  const notificationListener = useRef();
  const responseListener = useRef();

  const [routes] = useState([
    { key: 'first', title: 'Connections' },
    { key: 'second', title: 'Connecting' },
    { key: 'third', title: 'Requests' },
    { key: 'fourth', title: 'Connected' },
  ]);


  useEffect(() => {

    if(Platform.OS !== 'web'){

    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }
  }, []);

  
  const schedulePushNotification = async () => {
    if(Platform.OS !== 'web'){
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'Here is the notification body',
        sound: '../../../../assets/Notifications/Notification.mp3',
        data: { data: 'goes here' },
      },
      trigger: { seconds: 2 },
    });
   }
  }
  
  const  registerForPushNotificationsAsync = async () =>{
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

   if(token){
        firebase.firestore()
        .collection('users')
        .doc(props.User.currentUser.uid)
        .update({
          token: token
        })
        .then(() => {
          console.log('User updated!');
        });
   }
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }


  const sendNotificationAllUser = async () => {
    if(Platform.OS !== 'web'){
    const db = firebase.firestore();
    const users = await db.collection('users').get();
    users.forEach(async (user) => {
      const token = user.data().token;
      if (token) {
        await sendNotification(token);
      }
    });
   }
  };

  useEffect(() => {
    const unsubscribe = firebase.firestore()
         .collection('users')
         .onSnapshot((snapshot) => {
            let users = [];
            snapshot.docs.map((doc) => {
              if(!allRelationships.includes(doc.id)){
                const user = {
                  id: doc.id,
                  ...doc.data()
                };
                users.push(user);
              }
            })
            setConnections(users);
          });
    return () => {
      unsubscribe();
    }
  }, [allRelationships]);
   

  useEffect(() => {
    let user = [];
    connected.forEach((item) => {
      user.push(item.uid);
    })
    connecting.forEach((item) => {
      user.push(item.uid);

    })
    connectingRequests.forEach((item) => {
      user.push(item.uid);

    })
    if(!user.includes(props.User.currentUser.uid)){
      user.push(props.User.currentUser.uid);
    }
    setAllRelationships(user);
    
  }, [connected, connecting, connectingRequests]);
  
  useEffect(() => {
    setConnected(props.User.connected);
  }, [props.User.connected]);

  useEffect(() => {
    setConnecting(props.User.connecting);
  }, [props.User.connecting]);
  useEffect(() => {
    setConnectingRequests(props.User.connectingRequests);
  }, [props.User.connectingRequests]);
  useEffect(() => {
    setUser(props.User.currentUser);
  },  [props.User.currentUser]);

 

  const sendNotification = async (token) => {
    if(Platform.OS !== 'web' && token){
    const message = {
      to: token,
      sound: 'default',
      title: 'New Connection Request',
      body: 'You have a new connection request',
      data: { data: 'goes here' },
      _displayInForeground: true,
    };
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
   }
  }







  const sendNotificationUnconnected = async (token) => {
    if(Platform.OS !== 'web' && token){
    const message = {
      to: token,
      sound: 'default',
      title: 'Connection Unconnected',
      body: 'You have been unconnected from a connection',
      data: { data: 'goes here' },
      _displayInForeground: true,
    };
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    }
  }

  const sendNotificationConnected = async (token) => {
    if(Platform.OS !== 'web' && token){
    const message = {
      to: token,
      sound: 'default',
      title: 'Connection Connected',
      body: `${user.name} has accepted your connection request`,
      data: { data: 'goes here' },
      _displayInForeground: true,
    };
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
   }
  }

  const sendNotificationConnectingRequest = async (token) => {
    if(Platform.OS !== 'web' && token){
    const message = {
      to: token,
      sound: 'default',
      title: 'Connection Request',
      body: `You have a new connection request from ${user.name}`,
      data: { data: 'goes here' },
      _displayInForeground: true,
    };
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
   }
  }


  const SearchUser = (search) => {
    if(search.length > 0){
      const unsubscribe = firebase.firestore()
      .collection('users')
      .where('name', '>=', search)
      .where('name', '<=', search + '\uf8ff')
      .onSnapshot((snapshot) => {
        let users = [];
        snapshot.forEach((doc) => {
          users.push(doc.data());
        });
        setSearchUser(users);
      });
      return () => unsubscribe();
    } else {
      setSearchUser([]);
      setModalVisible(false);
    }
  };




  const RequestsScreen = useCallback(() => (
    <View key={Date.now()} style={{ flex: 1, backgroundColor: props.UI.backgroundColor }}>
        <FlatList
                // scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                numColumns={1}
                data={connectingRequests}
                renderItem={({ item }) => (
                    <View style={{flex: 1,  flexDirection: 'row', alignItems: 'space-between', padding: 10, }}>
                        <TouchableOpacity onPress={() => props.navigation.navigate('Profile', { uid: item.uid, user : item })}>
                            <Image source={{ uri: item.user?.photoURL}} style={{ width: 50, height: 50, borderRadius: 25 }} />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 10,marginBottom: 5 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: props.UI.textColor }}>{item.user?.name}</Text>
                            <Text style={{ fontSize: 14, color: props.UI.textColor }}>{
                             item?.timestamp &&  moment(item.timestamp.toDate()).fromNow()
                            }</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => {
                                  firebase.firestore().collection('users').doc(user.uid).collection('connected').doc(item.uid).set({
                                    uid: item.uid,
                                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                    user: item.user,
                                  }).then(() => {
                                    firebase.firestore().collection('users').doc(item.uid).collection('connected').doc(user.uid).set({
                                      uid: user.uid,
                                      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                      user : {
                                        name: user.name,
                                        photoURL: user.photoURL,
                                        uid: user.uid,
                                        token: user.token,
                                      }
                                    }).then(() => {
                                      firebase.firestore().collection('users').doc(user.uid).collection('connectingRequests').doc(item.uid).delete().then(() => {
                                        firebase.firestore().collection('users').doc(item.uid).collection('connecting').doc(user.uid).delete().then(() => {
                                          const uid = [user.uid, item.uid].sort().join('');
                                          firebase.firestore().collection('chats').doc(uid).set({
                                            uid,
                                            lastMessage: '',
                                            users: [user.uid, item.uid],
                                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                          }).then(() => {
                                            sendNotificationConnected(item.token);
                                          })
                                        })
                                      })
                                    })
                                  })
                                }}>
                                    <MaterialCommunityIcons name="account-check" size={30} color={props.UI.textColor} />
                                </TouchableOpacity> 
                                <TouchableOpacity onPress={() => {
                                  firebase.firestore().collection('users').doc(user.uid).collection('connectingRequests').doc(item.uid).delete().then(() => {
                                    firebase.firestore().collection('users').doc(item.uid).collection('connecting').doc(user.uid).delete().then(() => {
                                      sendNotificationUnconnected(item.user.token);
                                    })
                                  })
                                }}
                                style={{ marginLeft: 10 }}>
                                    <MaterialCommunityIcons name="account-remove" size={30} color={props.UI.textColor} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                listKey={(item) => item.uid}
            />
    </View>
  ), [connectingRequests]);

  const ConnectedScreen = useCallback(() => (
    <View key={Date.now()} style={{ flex: 1, backgroundColor: props.UI.backgroundColor }}>
        <FlatList
                // scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                numColumns={1}
                data={connected}
                renderItem={({ item }) => (
                    <View style={{flex: 1,  flexDirection: 'row', alignItems: 'space-between', padding: 10, }}>
                        <TouchableOpacity onPress={() => props.navigation.navigate('Profile', { uid: item.uid, user: item })}>
                            <Image source={{ uri: item.user?.photoURL }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 10 }}> 
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: props.UI.textColor }}>{item.user?.name}</Text>
                            <Text style={{ fontSize: 14, color: props.UI.textColor }}>{
                              item?.timestamp &&  moment(item.timestamp.toDate()).fromNow()
                            }
                            </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                           <TouchableOpacity onPress={() => {
                              firebase.firestore().collection('users').doc(user.uid).collection('connected').doc(item.uid).delete().then(() => {
                                firebase.firestore().collection('users').doc(item.uid).collection('connected').doc(user.uid).delete().then(() => {
                                  sendNotificationUnconnected(item.user.token);
                                })
                              })
                            }}>
                                <MaterialCommunityIcons name="account-remove" size={30} color={props.UI.textColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                listKey={(item) => item.uid}
            />
    </View>
  ), [connected]);

  const ConnectionsScreen = useCallback(() => (
    <View key={Date.now().toString()} style={{ flex: 1, backgroundColor: props.UI.backgroundColor }}>
        <FlatList
                // scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                numColumns={1}
                data={connections}
                renderItem={({ item}) => (
                    <View  key={Date.now().toString()}  style={{flex: 1,  flexDirection: 'row', alignItems: 'space-between', padding: 10, }}>
                        <TouchableOpacity onPress={() => props.navigation.navigate('Profile', { uid: item?.uid, user : item })}>
                            <Image source={{ uri: item?.photoURL  }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 10, marginTop: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: props.UI.textColor }}>{item?.name}</Text>
                            <Text style={{ fontSize: 14, color: props.UI.textColor }}>{item?.userName}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={() => {
                              firebase.firestore().collection('users').doc(item.uid).collection('connectingRequests').doc(user.uid).set({
                                uid: user.uid,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                user: {
                                  name: user?.name || '',
                                  photoURL: user?.photoURL || null,
                                  uid: user?.uid || '',
                                  token: user?.token || '',
                                }
                              }).then(() => {
                                firebase.firestore().collection('users').doc(user.uid).collection('connecting').doc(item.uid).set({
                                  uid: item.uid,
                                  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                  user: {
                                    name: item?.name || null,
                                    photoURL: item?.photoURL || null,
                                    uid: item?.uid || null,
                                    token: item?.token || null,
                                  }
                                }).then(() => {
                                  if(item?.token) {
                                      sendNotificationConnectingRequest(item.token);
                                  }
                                })
                              })
                            }
                            }>
                                <MaterialCommunityIcons name="account-plus" size={30} color={props.UI.textColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                listKey={(item) => item.uid}
            />
    </View>
  ), [connections]);
  
  const ConnectingScreen = useCallback(() => (
    <View key={Date.now().toString()} style={{ flex: 1, backgroundColor: props.UI.backgroundColor, width: layout.width }}>
          <FlatList
              // scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              numColumns={1}
              data={connecting}
              renderItem={({ item }) => ( 
                  <View key={Date.now().toString()}  style={{ flex: 1, flexDirection: 'row', alignItems: 'space-between', padding: 10, }}>
                      <TouchableOpacity onPress={() => props.navigation.navigate('Profile', { uid: item.uid, user : item.user })}>
                          <Image source={{ uri: item.user?.photoURL }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                      </TouchableOpacity>
                      <View style={{ marginLeft: 10 }}>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', color: props.UI.textColor }}>{item.user?.name}</Text>
                          <Text style={{ fontSize: 14, color: props.UI.textColor}} >{
                            item?.timestamp && moment(item.timestamp.toDate()).fromNow()
                          }</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <TouchableOpacity onPress={() => {
                            firebase.firestore().collection('users').doc(user.uid).collection('connecting').doc(item.uid).delete().then(() => {
                              firebase.firestore().collection('users').doc(item.uid).collection('connectingRequests').doc(user.uid).delete().then(() => {
                                console.log('deleted');
                              })
                            })
                          }}>
                              <MaterialCommunityIcons name="account-remove" size={30} color={props.UI.textColor} />
                          </TouchableOpacity>
                      </View>
                  </View>
              )}
              listKey={(item) => item?.uid}
            />
    </View>
  ), [connecting]);

  const getIcon = (route) => {
    switch (route.title) {
      case 'Connected':
        return 'account-check';
      case 'Connections':
        return 'account-search';
      case 'Connecting':
        return 'account-clock';
      case 'Requests':
        return 'account-question';
    }
  };

                  


  const {theme, textColor, backgroundColor} = props.UI;


  return (
    <View style={{ flex: 1, backgroundColor: props.UI.backgroundColor }}>
         <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
             }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => props.navigation.navigate('Profile', { uid: props.User.currentUser.uid })}>
                      <Image
                          source={{ uri: props.User.currentUser?.photoURL }}
                          style={{ width: 50, height: 50, borderRadius: 25 }}
                      />
                  </TouchableOpacity>
                  <KeyboardAvoidingView>
                    <TextInput
                        placeholder="Search"
                        style={{
                            width: layout.width - 69,
                            height: 40,
                            backgroundColor:'#fff',
                            color:  '#000',
                            borderRadius: 20,
                            paddingLeft: 10,
                            marginLeft: 10,
                            paddingRight: 10,
                            marginRight: 10,
                        }}
                        onChangeText={(text) => {
                          SearchUser(text);
                          setSearch(text);
                        }}
                        value={search}
                        onSubmitEditing={() => {
                          if (search !== '') {
                            props.navigation.navigate('Search', { search });
                          }
                        }}
                        onPressIn={() => {
                          setModalVisible(true);
                        }}
                        onClick={() => { setModalVisible(true); }}
                        


                    />
                  </KeyboardAvoidingView>
              </View>
         </View>
              <Modal 
                visible={modalVisible} 
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
                >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: props.UI.theme === 'dark' ? '#000' : '#fff',
               }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => props.navigation.navigate('Profile', { uid: props.User.currentUser.uid })}>
                      <Image
                          source={{ uri: props.User.currentUser?.photoURL }}
                          style={{ width: 50, height: 50, borderRadius: 25 }}
                      />
                  </TouchableOpacity>
                  <KeyboardAvoidingView>
                    <TextInput
                        placeholder="Search"
                        style={{
                            width: layout.width - 69,
                            height: 40,
                            backgroundColor: '#fff' ,
                            color: '#000',
                            borderRadius: 20,
                            paddingLeft: 10,
                            marginLeft: 10,
                            paddingRight: 10,
                            marginRight: 10,
                        }}
                        onChangeText={(text) => {
                          SearchUser(text);
                          setSearch(text);
                        }}
                        value={search}
                        onSubmitEditing={() => {
                          setModalVisible(false);
                        }}

                    />
                  </KeyboardAvoidingView>
              </View>
              </View>
                <View style={{ flex: 1, backgroundColor: props.UI.backgroundColor }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="ios-arrow-back" size={30} color={props.UI.theme === 'dark' ? '#fff' : '#000'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="ios-close" size={30} color={props.UI.theme === 'dark' ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            numColumns={1}
                            data={searchUser}
                            renderItem={({ item }) => (
                                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10,  }}>
                                    <TouchableOpacity onPress={() => {
                                      setModalVisible(false);
                                      props.navigation.navigate('Profile', { uid: item.uid })}
                                    }>
                                        <Image source={{ uri: item?.photoURL }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: props.UI.textColor }}>{item.name}</Text>
                                    </View>
                                </View>
                            )}
                            keyExtractor={(item) => item.uid}
                            listKey={(item) => item.uid}

                        />
                    </View>
                </View>
              </Modal>
        <TabView
            navigationState={{ index, routes }}
            renderScene={({ route }) => {
                switch (route.key) {
                    case 'first':
                        return <ConnectionsScreen  />;
                    case 'second':
                        return <ConnectingScreen />;
                    case 'third':
                        return <RequestsScreen  />;
                    case 'fourth':
                        return <ConnectedScreen />;
                }
              }}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderTabBar={(props) => (
                <TabBar
                    {...props}
                    indicatorStyle={{ backgroundColor: theme === 'dark' ? '#fff' : '#000' }}
                    style={{ backgroundColor: backgroundColor }}
                    renderLabel={({ route, focused, color }) => (
                        <Text key={route.key} style={{ color: textColor, margin: 8 }}>
                              {<MaterialCommunityIcons name={getIcon(route)} size={25} color={textColor} />} 
                        </Text>
                    )}
                />
            )}
            listKey={(item) => item.uid}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',

  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  modalButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#000',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalItem: {
    width: '100%',
    height: 40,
    backgroundColor: '#000',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
  },

});

  
const mapStateToProps = (store) => {
  return {
    UI : store.UI,
    User: store.User,
    Users: store.Users,
  };
}


export default connect(mapStateToProps)(MyConnect);