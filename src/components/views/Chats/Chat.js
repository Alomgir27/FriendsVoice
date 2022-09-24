import React, { useState, useEffect, useCallback, useRef} from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Alert, ImageBackground , Dimensions, Button, Keyboard, Animated} from 'react-native'

import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { Video, Audio } from 'expo-av';

import uuid from 'react-native-uuid';


import { connect } from 'react-redux'

import firebase from '../../../../firebase'

import * as ImagePicker from 'expo-image-picker';
function Chat(props) {


  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [audio, setAudio] = useState(null);
  const [sound, setSound] = useState(null);
  const [status, setStatus] = useState(null);
  const [audioRecording, setAudioRecording] = useState(null);
  const [recording, setRecording] = React.useState();
  const [messages, setMessages] = useState([]);
  const [textColor, setTextColor] = useState(props.UI.textColor);
  const [backgroundColor, setBackgroundColor] = useState(props.UI.backgroundColor);
  const [text, setText] = useState('');
  const [onfocus, setOnfocus] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);






  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: 100, marginRight: 20}}>
          <TouchableOpacity style={{marginRight: 10}} onPress={() => {
            Alert.alert(
              'Audio Call',
              'Coming Soon',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              {cancelable: false},
            );
          }}>
            <MaterialCommunityIcons name="phone" size={27} color={props.UI.textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={{marginRight: 10}} onPress={() => {
            Alert.alert(
              'Video Call',
              'Coming Soon',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              {cancelable: false},
            );
          }}>
            <MaterialCommunityIcons name="video" size={27} color={props.UI.textColor} />
          </TouchableOpacity>
            <TouchableOpacity style={{marginRight: 10}} onPress={() => props.navigation.navigate('Profile', {uid : props.User.currentUser.uid})}>
          <MaterialCommunityIcons name="account-circle" size={27} color={props.UI.textColor} />
        </TouchableOpacity>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity style={{marginLeft: 10}} onPress={() => props.navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={27} color={props.UI.textColor} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: props.UI.backgroundColor,
      },
      headerTintColor: props.UI.textColor,
      headerTitle: props.route.params.item.user.name,
    })
  }, [])


  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need audio permissions to make this work!');
      }
    })();
  }, []);
  


  useEffect(() => {
    setBackgroundColor(props.UI.backgroundColor)
    setTextColor(props.UI.textColor)
  }, [props.UI.backgroundColor, props.UI.textColor])

  useEffect(() => {
    firebase.firestore()
    .collection('chats')
    .doc(props.route.params.item.uid)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === 'added')
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messagesFirestore);
      console.log(messagesFirestore)
    });
  }, []);

  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    },
    [messages]
  );

  const handleSend = async (messages) =>{
    const writes = messages.map((m) => firebase.firestore()
    .collection('chats')
    .doc(props.route.params.item.uid)
    .collection('messages')
    .add(m));
    await Promise.all(writes);
  }

  const sendMessages = () => {
    let message = {
      _id: uuid.v4(),
      createdAt: new Date(),
      user: {
        _id: props.User.currentUser.uid,
        name: props.User.currentUser.name,
        avatar: props.User.currentUser.photoURL,
      },
    };
    if (text.length > 0) {
      message.text = text;
      const lastMessage = text;
      handleSend([message]);
      setText('');
      firebase.firestore()
      .collection('chats')
      .doc(props.route.params.item.uid)
      .update({
        lastMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }
  };
  
 const sendVideo = async (video) => {
    let message = {
      _id: uuid.v4(),
      createdAt: new Date(),
      user: {
        _id: props.User.currentUser.uid,
        name: props.User.currentUser.name,
        avatar: props.User.currentUser.photoURL,
      },
    };
    const task = firebase.storage()
    .ref()
    .child('chats/' + props.route.params.item.uid + '/' + 'videos/' + uuid.v4())
    .put(video);
    task.on('state_changed', taskSnapshot => {
      console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
    });
    task.then(async () => {
      const url = await task.snapshot.ref.getDownloadURL();
      message.video = url;
      handleSend([message]);
    });
  };

  const sendImage = async (image) => {
   
    let message = {
      _id: uuid.v4(),
      createdAt: new Date(),
      user: {
        _id: props.User.currentUser.uid,
        name: props.User.currentUser.name,
        avatar: props.User.currentUser.photoURL,
      },
    };

    const task = firebase.storage()
    .ref()
    .child('chats/' + props.route.params.item.uid + '/' + 'images/' + uuid.v4())
    .put(image);
    task.on('state_changed', taskSnapshot => {
      console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
    });
    task.then(async () => {
      const url = await task.snapshot.ref.getDownloadURL();
      message.image = url;
      handleSend([message]);
    });

  };


  const sendAudio = async (audio) => {
    let message = {
      _id: uuid.v4(),
      createdAt: new Date(),
      user: {
        _id: props.User.currentUser.uid,
        name: props.User.currentUser.name,
        avatar: props.User.currentUser.photoURL,
      },
    };
    const task = firebase.storage()
    .ref()
    .child('chats/' + props.route.params.item.uid + '/' + 'audios/' + uuid.v4())
    .put(audio);
    task.on('state_changed', taskSnapshot => {
      console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
    });
    task.then(async () => {
      const url = await task.snapshot.ref.getDownloadURL();
      console.log(url)
      message.audio = url;
      handleSend([message]);
    });
  };



  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        
      });
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.highQuality);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

   const stopRecording = async () => {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    

    const response = await fetch(uri);
    const blob = await response.blob();
    sendAudio(blob);
  }
 


  return (
    <View style={[styles.container, { backgroundColor : props.UI.backgroundColor}]}
     onStartShouldSetResponder={() => Keyboard.dismiss()}
     >
      <GiftedChat
        messages={messages}
        // onSend={handleSend}
        onPressAvatar={() => props.navigation.navigate('Profile', {uid : props.route.params.item.user.uid, user: props.route.params.item.user})}
        videoProps={{
          shouldPlay: false,
          resizeMode: Video.RESIZE_MODE_CONTAIN,
          isLooping: false,
          isMuted: true,

        }}
        imageProps={{
          resizeMode: 'cover',
        }}
        renderUsernameOnMessage={true}
        renderFooter={() => (
          <View style={{height: 27, backgroundColor: props.UI.backgroundColor}}></View>
        )}
        user={{
          _id: props.User.currentUser.uid,
          name: props.User.currentUser.name,
          avatar: props.User.currentUser.photoURL,
        }}
        renderMessageVideo={(props) => {
          return (
            <View style={{width: 200, height: 200}}>
              <Video
                source={{ uri: props.currentMessage.video }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                useNativeControls
                style={{ width: 200, height: 200 }}
              />
            </View>
          );
        }}

        renderMessageImage={(props) => {
          return (
            <ImageBackground
              style={{
                width: 200,
                height: 200,
                borderRadius: 13,
                margin: 3,
                overflow: 'hidden',
              }}
              source={{ uri: props.currentMessage.image }}
            >
            </ImageBackground>
          );
        }}
        isAnimated={true}
        renderComposer={(props) => {
          return (
            <View style={{
              flexDirection: 'row', 
               alignItems: 'center',
               justifyContent: 'space-between',
               backgroundColor: backgroundColor,
               height: 42,
               width: Dimensions.get('window').width ,
               marginBottom: 5,
               marginTop: 5,
              }}>
              {!onfocus && (
                <>
                 <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 4,
                  marginBottom: 4,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  borderRadius: 15,
                }}
                onPress={async () => {
                  let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                    // allowsEditing: true,
                    // aspect: [4, 3],
                    quality: 0.5,
                  });
                  
                  if (!result.cancelled) {
                     const response = await fetch(result.uri);
                      const blob = await response.blob();
                      const type = blob.type.split('/')[0];
                      if(type === 'image'){
                       sendImage(blob);
                      }
                      else {
                        sendVideo(blob);
                      }
                  }
                }}
              >
                <MaterialCommunityIcons name="image" size={25} color={textColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 4,
                  marginBottom: 4,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  borderRadius: 15,
                  marginLeft: 4,
                }}
                onPress={async () => {
                  let result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                    // allowsEditing: true,
                    // aspect: [4, 3],
                    quality: 0.5,
                  });
                  
                  if (!result.cancelled) {
                     const response = await fetch(result.uri);
                     const blob = await response.blob();
                     const type = blob.type.split('/')[0];
                     if(type === 'image'){
                        sendImage(blob);
                     }else{
                        sendVideo(blob);
                     }
                  }
                }}
              >
                <MaterialCommunityIcons name="camera" size={25} color={textColor} />
              </TouchableOpacity>
              <TouchableOpacity style={{
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 4,
                marginBottom: 4,
                backgroundColor: backgroundColor,
                color: textColor,
                borderRadius: 15,
                marginLeft: 4,
              }}
              onPressIn={async() => {
                startRecording();
              }
              }
              onPressOut={async() => {
                stopRecording();
              }
              }
              >
                <MaterialCommunityIcons name="microphone" size={25} color={recording ? '#c0392b' : textColor} 
                style={{
                  transform: [{ scale : recording ? 1.2 : 1}] 
                }}
                />
              </TouchableOpacity>
              </>
              )}

              <View style={{flex: 1, marginLeft: 4, marginRight: 4}}>
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: textColor,
                    backgroundColor: backgroundColor,
                    borderRadius: 25,
                    padding: 10,
                    width: onfocus ? Dimensions.get('window').width - 40 :  Dimensions.get('window').width - 155,
                    height: 20,
                    borderColor: textColor,
                    borderWidth: 1,
                    animation: 'slideInLeft',
                    transition: 'all 0.5s ease-in-out',
                  }}
                  multiline={true}
                  placeholder="Type your message here..."
                  placeholderTextColor={textColor}
                  onChangeText={(text) => {
                    setText(text);
                    }}
                  value={text}
                  onSelectionChange={(event) => {
                    if(event.nativeEvent.selection.start === 0 && event.nativeEvent.selection.end === 0){
                      setOnfocus(false);
                    }
                    else{
                      setOnfocus(true);
                    }
                  }}
                  />
              </View>
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 4,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  borderRadius: 15,
                  marginRight: 5,

                }}
                onPress={sendMessages}
              >
                <MaterialCommunityIcons name="send" size={26} color={textColor}  />
              </TouchableOpacity>
            </View>
          );
        }}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                right: {
                  backgroundColor: '#0084ff',
                },
                left: {
                  backgroundColor: '#2c2f33',
                },
              }}
              textStyle={{
                right: {
                  color: '#fff',
                },
                left: {
                  color: '#fff',
                },
              }}

              />
          );
        }}

        audioProps={{
          controls: true,
          resizeMode: 'cover',
          repeat: true,
          paused: false,
          muted: false,
          volume: 1.0,
          rate: 1.0,
          playInBackground: false,
          playWhenInactive: false,
          ignoreSilentSwitch: null,
          progressUpdateInterval: 250.0,
        }}

        renderMessageAudio={(props) => {
          // console.log(props)
          return (
            <TouchableOpacity onPress={async () => {
               const { sound } = await Audio.Sound.createAsync(
                { uri: props.currentMessage.audio },
                { shouldPlay: true }
              );
              await sound.playAsync();
            }}>
              <Text style={{color: textColor, fontSize: 12, marginLeft: 10, marginRight: 10, marginBottom: 5}}>{props.currentMessage.user.name} sent an audio</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 5,
                marginLeft: 5,
                marginRight: 5,
              }}>
                <MaterialCommunityIcons name="microphone" size={25} color={textColor} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});



const mapStateToProps = (store) => ({
  User: store.User,
  UI: store.UI,
});

export default connect(mapStateToProps)(Chat);