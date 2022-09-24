import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Alert, 
  ImageBackground, 
  Button, 
  Platform,
  ScrollView,
  ActivityIndicator
 } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as MediaLibrary from 'expo-media-library';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';


import firebase from '../../../../firebase'


import { MaterialCommunityIcons } from 'react-native-vector-icons';

import { fetchUserPosts } from '../../../redux/actions/UserActions';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

function Post(props) {
   const [caption, setCaption] = useState('');
   const [image, setImage] = useState(null);
   const [video, setVideo] = useState(null);
   const [loading, setLoading] = useState(false);



   useEffect(() => {
      (async () => {
          if (Platform.OS !== 'web') {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                  alert('Sorry, we need camera roll permissions to make this work!');
              }
              const response = await ImagePicker.requestCameraPermissionsAsync();
              if (response.status !== 'granted') {
                  alert('Sorry, we need camera permissions to make this work!');
              }
              
          }
      })();
  }, []);

  const onPostSend = async () => {
    if (image || video) {
      setLoading(true);
      const uploadUri = video || image;
      const result = await fetch(uploadUri);
      const blob = await result.blob();
      const type = video ? 'video' : 'image';
      const childPath = `posts/${props.User.currentUser.uid}/${Date.now()}`;
      const storageRef = firebase.storage().ref().child(childPath);
      const task = storageRef.put(blob);
      task.on('state_changed', taskSnapshot => {
        console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
      });
      task.then(async () => {
        const url = await storageRef.getDownloadURL();
        const remoteUri = image ? url : await VideoThumbnails.getThumbnailAsync(url, {
          time: 15000,
        });
        firebase.firestore()
        .collection('posts')
        .doc(props.User.currentUser.uid)
        .collection('userPosts')
        .add({
          type,
          remoteUri,
          caption,
          likesCount: 0,
          commentsCount: 0,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        }).then((function () {
          setLoading(false);
          setCaption('');
          setImage(null);
          setVideo(null);
          props.fetchUserPosts();
          // props.navigation.navigate('Home');
        }));
      });
    } else {
      Alert.alert('Error', 'Please select an image or video to share!');
    }
  };

  
   
  const getVideoThumbnail = async (videoUri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        videoUri,
        {
          time: 15000,
        }
      );
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

    useEffect(() => {
      if (props.route.params?.image) {
        setImage(props.route.params.image);
      }
      
      (async () => {
        if(props.route.params?.video){
          setVideo(props.route.params.video);
          const thumbnail = await getVideoThumbnail(props.route.params.video);
          setImage(thumbnail);
        }
      })();

      console.log(props.User.currentUser)
      
    }, [props.route.params?.image, props.route.params?.video]);

    
   const onChangeCaption = (textValue) => setCaption(textValue);

    const onPickImage = async () => {
      activateKeepAwake();

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
      });
      

      if (!result.cancelled) {
        setImage(result.uri);
      }

      deactivateKeepAwake();
      
    };

  if(loading){
    return(
    <View style={[styles.loading, { backgroundColor: props.UI.backgroundColor}]}>
      <ActivityIndicator size="large" color={props.UI.textColor} />
    </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor : props.UI.backgroundColor}]}>
      <ScrollView 
      style={styles.ScrollContainer}
      showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={30} color={props.UI.textColor} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Text style={[styles.headerText, { color : props.UI.textColor}]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPostSend()}>
            <Text style={[styles.headerText, { color : props.UI.textColor}]}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Image source={{uri : props.User.currentUser?.photoURL ? props.User.currentUser?.photoURL: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'}} style={styles.avatar} />
        <TextInput
          style={[styles.input, { color : props.UI.textColor, 
            borderColor : props.UI.textColor,
            backgroundColor : props.UI.backgroundColor,
            borderWidth : 1,
            borderRadius : 10,
            padding : 10,
            textAlignVertical : 'top',
            fontSize : 16,
          }]}
          placeholder="What's on your mind?"
          placeholderTextColor={props.UI.textColor}
          multiline={true}
          numberOfLines={6}
          onChangeText={onChangeCaption}
          value={caption}
        />
      </View>

      <View style={styles.ImageAndVideoConatiner}>
        {image && (
          <View style={styles.ImageAndVideo}>
            <Image 
            source={{ uri: image }} 
            style={{ 
              width: 350,
              height: 350,
              maxWidth : 350,
              maxHeight : 350,
              borderRadius : 20,
              margin : 10,
              resizeMode : 'cover',
            }}
            />
            <TouchableOpacity onPress={() => {
              setImage(null);
              setVideo(null);
            }}
            style={styles.removeImage}
            >
              <MaterialCommunityIcons name="close" size={30} color={props.UI.backgroundColor} />
            </TouchableOpacity>
          </View>
        )
         }
        
      </View>
      <View style={styles.footer}>
        <TouchableOpacity onPress={onPickImage}>
          <MaterialCommunityIcons name="image-outline" size={30} color={props.UI.textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => props.navigation.navigate('Camera', { photo: "photo" })}>
          <MaterialCommunityIcons name="camera-outline" size={30} color={props.UI.textColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => props.navigation.navigate('Camera', { video : "video" })}>
          <MaterialCommunityIcons name="video-outline" size={30} color={props.UI.textColor} />
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    marginTop : -100,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  
  headerTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
  },
  ImageAndVideoConatiner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  ScrollContainer: {
    flex: 1,
  },
  ImageAndVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImage: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 50,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },


});



const mapStateToProps = (store) => {
  return {
    UI: store.UI,
    User: store.User,
  }
}


const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchUserPosts }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Post);

