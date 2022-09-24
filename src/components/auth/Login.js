import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Alert, Button, ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';


import {  connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { ToggleTheme } from '../../redux/actions/UIActions';
import { colors } from '../../redux/constants';
import { FontAwesome } from 'react-native-vector-icons';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import firebase from '../../../firebase';


WebBrowser.maybeCompleteAuthSession();


function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorEmail, setErrorEmail] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const [accessToken, setAccessToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [message, setMessage] = useState();

    const google = {
        config: {
                expoClientId: '269180507177-5demqkver0avgjupe6am2g7jtehvug4k.apps.googleusercontent.com',
                webClientId: '269180507177-0a8tg6un90r09delserlgj8l0eftlf11.apps.googleusercontent.com',
                iosClientId: "269180507177-avdk7lbd1sftlnlr9qbhv3gv9ckiqq6b.apps.googleusercontent.com",
                androidClientId: "269180507177-s2sf10ok4qmufsfebhv50ibqrm4bet12.apps.googleusercontent.com",
        }
    }
    const [request, response, promptAsync] = Google.useAuthRequest(google.config);
    

    useEffect(() => {
        getUserData();
      }, [accessToken]);


      useEffect(() => {
        if (userInfo) {
                let { email, name, picture, id } = userInfo;
                firebase.auth().fetchSignInMethodsForEmail(email).then((methods) => {
                    if(methods.length === 0){
                        firebase.auth().createUserWithEmailAndPassword(email, userInfo?.id).then((user) => {
                            firebase.firestore().collection('users').doc(user.user.uid).set({
                                name,
                                email,
                                photoURL : picture,
                                uid: user.user.uid,
                                theme: 'light',
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            }).then(() => {
                                console.log('User account created & signed in!');
                            })
                        })
                    } else {
                        firebase.auth().signInWithEmailAndPassword(email, id).then((user) => {
                            console.log(user.user);
                            console.log('User account signed in!');
                        })
                    }
                });
        }
      }, [userInfo]);

    
       const getUserData = async () => {
         await fetch("https://www.googleapis.com/userinfo/v2/me", {
          headers: { Authorization: `Bearer ${accessToken}`}
        })
        .then((response) => response.json())
        .then((responseJson) => {
            if(!responseJson?.error){
                console.log(responseJson);
              setUserInfo(responseJson);
            }
        })
        .catch((error) => {
            console.error(error);
        });
      }



    const onEmailChange = (text) => {
        setErrorEmail('');
        setErrorPassword('');
        setEmail(text);
    }
    const onPasswordChange = (text) => {
        setErrorEmail('');
        setErrorPassword('');
        setPassword(text);
    }
    const onSignIn = () => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
        if (reg.test(email) === false) {
            setErrorEmail('Email is not valid');
            return false;
        }
        else if (password.length < 6) {
            setErrorPassword('Password must be at least 6 characters');
            return false;
        }
        else {
            setLoading(true);
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((user) => {
                    console.log(user.user);
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                    setErrorPassword(error.message);
                    Alert.alert('User not found', 'Please check your email and password');
              });
        }
    }
    const signInWithGooglePopUp = async () => {
       const { iosClientId, androidClientId, expoClientId } = google.config;
         try { 
              const result = await promptAsync({
                 iosClientId,
                 androidClientId,
                 expoClientId,
                 scopes: ["profile", "email"],
              });
                if (result.type === "success") {
                    setAccessToken(result.authentication.accessToken);
                 }
            } catch (e) {
                Alert.alert('Error', e.message);
            }


    }
    const signInWithFacebookPopUp = () =>{
        const provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(() => {
                console.log('success');
            })
            .catch((error) => {
                Alert.alert('Error', error.message);
            });
    }
    const signInWithTwitterPopUp = () => {
        const provider = new firebase.auth.TwitterAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(() => {
                console.log('success');
            })
            .catch((error) => {
                Alert.alert('Error', error.message);
            });
    }
    const signInWithGithubPopUp = () => {
        const provider = new firebase.auth.GithubAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(() => {
                console.log('success');
            })
            .catch((error) => {
                Alert.alert('Error', error.message);
            });
    }
   

    return (
        <SafeAreaView style={[styles.container]}>
            <ImageBackground source={require('../../../assets/images/BackGround.png')} style={styles.image}>
                <KeyboardAvoidingView behavior='height' style={styles.body}>
                    <Input
                        placeholder='Email'
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        inputContainerStyle={{borderBottomColor: 'rgba(255,255,255,0.7)'}}
                        onChangeText={onEmailChange}
                        inputStyle={{color: 'white', paddingHorizontal: 10}}
                        value={email}
                        errorStyle={{ color: 'red' }}
                        errorMessage={errorEmail}

                    />
                    <Input
                        placeholder='Password'
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        inputContainerStyle={{borderBottomColor: 'rgba(255,255,255,0.7)'}}
                        onChangeText={onPasswordChange}
                        inputStyle={{color: 'white', paddingHorizontal: 10}}
                        errorStyle={{ color: 'red' }}
                        errorMessage={errorPassword}
                        value={password}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.buttonContainer}
                        onPress={onSignIn}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}
                        >Login</Text>
                    </TouchableOpacity>
                    <View style={styles.othersContainer}>
                        <Text style={styles.buttonText}>
                            Don’t have an account ? 
                        </Text>
                        <TouchableOpacity onPress={() => props.navigation.navigate('Registration')} style={styles.registerContainer}>
                                <Text style={styles.buttonTextRegister}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.othersProvideraccount}>
                        <Text style={styles.othersProvideraccountText}>Or sign In with</Text>
                        <View style={styles.othersProvideraccountButton}>
                            <TouchableOpacity onPress={signInWithGooglePopUp} style={styles.logoContainer}>
                                <FontAwesome name="google" size={30} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={signInWithFacebookPopUp} style={styles.logoContainer}>
                                <FontAwesome name="facebook" size={30} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={signInWithTwitterPopUp} style={styles.logoContainer}>
                                <FontAwesome name="twitter" size={30} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={signInWithGithubPopUp} style={styles.logoContainer}>
                                <FontAwesome name="github" size={30} color="white" />
                            </TouchableOpacity> 
                        </View>
                    </View>

                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
    ,
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 40,
        fontWeight: 'bold'
    },
    body: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        width: 300,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 20,
        color: '#FFF',
        paddingHorizontal: 10
    },
    image: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center"
    },
    buttonContainer: {
        backgroundColor: 'transparent',
        paddingVertical: 15,
        width: '95%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    buttonTextRegister: {
        color: '#2980b9',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    registerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    othersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    othersProvideraccount: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    othersProvideraccountText: {
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    othersProvideraccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
    }
});

const mapStateToProps = store => {
    return {
        UI: store.UI
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        ToggleTheme
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)