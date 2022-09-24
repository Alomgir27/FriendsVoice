import React, { useEffect , useState} from 'react'
import {  View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Alert, ImageBackground, Button, Platform, ScrollView, ActivityIndicator } from 'react-native'


import * as ImagePicker from 'expo-image-picker';

import firebase from 'firebase/compat'

import { fetchUser } from '../../../../redux/actions/UserActions';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'


function EditProfile(props) {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [imageBackground, setImageBackground] = useState(null);

    const [pickImage1, setPickImage1] = useState(null);
    const [pickImage2, setPickImage2] = useState(null);

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

    useEffect(() => {
        if(props.User.currentUser?.name){
            setName(props.User.currentUser.name)
        }
        if(props.User.currentUser?.bio){
            setBio(props.User.currentUser.bio)
        }
        if(props.User.currentUser?.location){
            setLocation(props.User.currentUser.location)
        }
        if(props.User.currentUser?.userName){
            setUserName(props.User.currentUser.userName)
        }
        if(props.User.currentUser?.imageBackground){
            setImageBackground(props.User.currentUser.imageBackground)
        }
        if(props.User.currentUser?.photoURL){
            setImage(props.User.currentUser.photoURL)
        }
    }, [props.User.currentUser])

       

    

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            // allowsEditing: true,
            // aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setPickImage1(result.uri);
        }
    }

    const pickImageBackground = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            // allowsEditing: true,
            // aspect: [4, 3],
            quality: 1,
        });

        console.log(result);
        
        if (!result.cancelled) {
            setPickImage2(result.uri);
        }
    }


    const onPostSend = async () => {
        setLoading(true);
        if (pickImage1) {
            const uploadUri = pickImage1;
            const response = await fetch(uploadUri);
            const blob = await response.blob();
            const childPath = `profile/${props.User.currentUser.uid}/profilePicture`;

            firebase.storage()
            .ref()
            .child(childPath)
            .delete()
            .then(() => {
                firebase.storage()
                .ref()
                .child(childPath)
                .put(blob)
                .then(async () => {
                    const url = await firebase.storage().ref(childPath).getDownloadURL();
                    firebase.firestore().collection('users').doc(props.User.currentUser.uid).update({
                        photoURL: url
                    })
                    .then(() => {
                        setImage(url);
                        // Alert.alert('Profile Picture Updated');
                    })
                    .catch((error) => {
                        console.log(error);
                        Alert.alert(error.message);
                    })
                })
            })
            .catch((error) => {
                
                  firebase.storage()
                    .ref()
                    .child(childPath)
                    .put(blob)
                    .then(async () => {
                        const url = await firebase.storage().ref(childPath).getDownloadURL();
                        firebase.firestore().collection('users').doc(props.User.currentUser.uid).update({
                            photoURL: url
                        })
                        .then(() => {
                            setImage(url);
                            // Alert.alert('Profile Picture Updated');
                        })
                        .catch((error) => {
                            console.log(error);
                            Alert.alert(error.message);
                        })
                    }
                )
            })

        }
        if (pickImage2) {
            const uploadUri = pickImage2;
            const response = await fetch(uploadUri);
            const blob = await response.blob();
            const childPath = `profile/${props.User.currentUser.uid}/profileBackground`;
            firebase.storage()
            .ref()
            .child(childPath)
            .delete()
            .then(() => {
                firebase.storage()
                .ref()
                .child(childPath)
                .put(blob)
                .then(async () => {
                    const url = await firebase.storage().ref(childPath).getDownloadURL();
                    firebase.firestore().collection('users').doc(props.User.currentUser.uid).update({
                        imageBackground: url
                    })
                    .then(() => {
                        setImageBackground(url);
                        // Alert.alert('Profile Background Updated');
                    })
                    .catch((error) => {
                        console.log(error);
                        Alert.alert(error.message);

                    })
                })
            })
            .catch((error) => {
                console.log(error);
                firebase.storage()
                .ref()
                .child(childPath)
                .put(blob)
                .then(async () => {
                    const url = await firebase.storage().ref(childPath).getDownloadURL();
                    firebase.firestore().collection('users').doc(props.User.currentUser.uid).update({
                        imageBackground: url
                    })
                    .then(() => {
                        setImageBackground(url);
                        // Alert.alert('Profile Background Updated');
                    })
                    .catch((error) => {
                        console.log(error);
                        Alert.alert(error.message);

                    })
                })
            })
        }
        const user = props.User.currentUser;
        const db = firebase.firestore();
        db.collection('users').doc(user.uid).update({
            name: name,
            bio: bio,
            location: location,
            userName: userName,
        }).then(() => {
            setLoading(false);
            if(Platform.OS === 'web'){
                props.navigation.navigate('Profile', {uid: props.User.currentUser.uid})
            }
            Alert.alert(
                "Profile Updated",
                "Your profile has been updated successfully",
                [
                    { text: "OK", onPress: () => props.navigation.navigate("Profile", { uid: props.User.currentUser.uid}) }
                ]
            );
        })
    }

    if(loading){
        return(
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#2e64e5" />
            </View>
        )
    }

    return (
        <View style={[styles.container, {backgroundColor : props.UI.backgroundColor}]}>
            <ScrollView>
                <View style={[styles.container, {backgroundColor : props.UI.backgroundColor}]}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.headerBackgroundImage} onPress={() => pickImageBackground()}>
                           <Image 
                            source={{uri: pickImage2 || imageBackground ? pickImage2 || imageBackground : 'https://img.freepik.com/free-photo/beautiful-shot-tree-savanna-plains-with-blue-sky_181624-21992.jpg?w=996&t=st=1662952524~exp=1662953124~hmac=a2591cd4eb748aaf051fbd8c2d16dfaf696edea2ca156708b213fa0ed60608b7'}}
                            style={styles.avatarBackground}
                            
                          />
                    </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.avatar} onPress={()=> pickImage()}>
                    <Image style={styles.avatarContainer} source={{ uri: pickImage1 || image ? pickImage1 || image : 'https://img.freepik.com/free-vector/african-landscape-poster_1284-12828.jpg?1&w=900&t=st=1662988675~exp=1662989275~hmac=45eb18793ce1db9c5657f753fa76517ecf7421a84c1e7e67e7c90b3ae7bc99b4' }} />
                    </TouchableOpacity>
                    <View style={styles.body}>
                        <View style={styles.bodyContent}>
                            <TextInput
                                style={[styles.input, { backgroundColor: props.UI.backgroundColor, color: props.UI.colors.gray.a, borderColor: props.UI.colors.gray.a }]}
                                placeholder="Name"
                                placeholderTextColor={props.UI.colors.gray.a}
                                onChangeText={(text) => setName(text)}
                                value={name}
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: props.UI.backgroundColor, color: props.UI.colors.gray.a, borderColor: props.UI.colors.gray.a }]}
                                placeholder="Username"
                                placeholderTextColor={props.UI.colors.gray.a}
                                onChangeText={(text) => setUserName(text)}
                                value={userName}
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: props.UI.backgroundColor, color: props.UI.colors.gray.a, borderColor: props.UI.colors.gray.a }]}
                                placeholder="Bio"
                                placeholderTextColor={props.UI.colors.gray.a}
                                onChangeText={(text) => setBio(text)}
                                value={bio}
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: props.UI.backgroundColor, color: props.UI.colors.gray.a, borderColor: props.UI.colors.gray.a }]}
                                placeholder="Location"
                                placeholderTextColor={props.UI.colors.gray.a}
                                onChangeText={(text) => setLocation(text)}
                                value={location}
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                            />
                            
                            <TouchableOpacity style={styles.buttonContainer} disabled={loading} onPress={() => onPostSend()}>
                                <Text style={styles.buttonText}>Update Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 200,
    },
    headerBackgroundImage: {
        width: '100%',
        height: '100%',
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: "white",
        marginBottom: 10,
        alignSelf: 'center',
        position: 'absolute',
        marginTop: 130
    },
    avatarContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 63,
        
    },
    name: {
        fontSize: 22,
        color: "#FFFFFF",
        fontWeight: '600',
    },
    body: {
        marginTop: 40,
    },
    bodyContent: {
        flex: 1,
        alignItems: 'center',
        padding: 30,
        height: '100%'
        
    },
    name: {
        fontSize: 28,
        color: "#696969",
        fontWeight: "600"
    },
    info: {
        fontSize: 16,
        color: "#00BFFF",
        marginTop: 10
    },
    description: {
        fontSize: 16,
        color: "#696969",
        marginTop: 10,
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: 10,
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 250,
        borderRadius: 30,
        backgroundColor: "#00BFFF",
    },
    input: {
        height: 48,
        borderRadius: 5,
        borderWidth: 1,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 30,
        marginRight: 30,
        paddingLeft: 16,
        width: 250
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    avatarBackground: {
        width: '100%',
        height: '100%',
    }
});



    
        
const mapStateToProps = (store) => ({
    UI : store.UI,
    User : store.User
})

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ fetchUser }, dispatch)
  }
  

export default connect(mapStateToProps,  mapDispatchToProps)(EditProfile)