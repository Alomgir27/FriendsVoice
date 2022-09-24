import React, { Component } from 'react'
import { View, Text, StyleSheet,  TouchableOpacity, KeyboardAvoidingView, Alert, ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from 'react-native-elements';
import { colors } from '../../redux/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


import {  connect } from 'react-redux'

import firebase from '../../../firebase';

class Registration extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            errorEmail: '',
            errorPassword: '',
            name: '',
            userName: '',
            loading: false,

        };
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onCreateAccount = this.onCreateAccount.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onUserNameChange = this.onUserNameChange.bind(this);
    }

    onEmailChange(email) {
        this.setState({ errorEmail: '' });
        this.setState({ errorPassword: '' });
        this.setState({ email: email });
    }
    onNameChange(name) {
        this.setState({ name: name });
    }

    onPasswordChange(password) {
        this.setState({ errorEmail: '' });
        this.setState({ errorPassword: '' });
        this.setState({ password: password });
    }
    
    onUserNameChange(userName) {
        this.setState({ userName: userName });
    }

   async onCreateAccount() {
        console.log('createAccount');
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
        if (reg.test(this.state.email) === false) {
            this.setState({ errorEmail: 'Email is not valid' });
            return false;
        }
        else if (this.state.password.length < 6) {
            this.setState({ errorPassword: 'Password must be at least 6 characters' });
            return false;
        }
       
        else {
            this.setState({ loading: true });
            await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then((user) => {
                    console.log('user', user, firebase.auth().currentUser);
                     firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({
                        name: this.state.name,
                        userName: this.state.userName,
                        email: this.state.email,
                        photoURL: firebase.auth().currentUser.photoURL,
                        theme: 'light',
                        uid: firebase.auth().currentUser.uid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    })
                    this.setState({ loading: false });
                })
           
                .then(async (res) => {
                    console.log('User added!');

                })
                .catch((err) => {
                    console.log('Error: ', err);
                })
               this.setState({ loading: false });
            }
        }
        


  render() {
    return (
      <SafeAreaView style={styles.container}>
       <ImageBackground source={require('../../../assets/images/FriendsVoice6.png')} style={styles.backgroundImage}>
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <View style={styles.logoContainer2}>
                    <Text style={styles.title}>Create an account</Text>
                </View>
                <View style={styles.formContainer}>
                   <Input
                        placeholder='Name'
                        leftIcon={{ type: 'font-awesome', name: 'user', color: colors.light }}
                        onChangeText={this.onNameChange}
                        value={this.state.name}
                        inputStyle={{ color: 'white' }}
                        inputContainerStyle={{ borderBottomColor: this.props.UI.backgroundColor }}
                        errorStyle={{ color: 'red' }}
                    />
                    <Input
                        placeholder='Username'
                        leftIcon={{ type: 'font-awesome', name: 'user', color: colors.light }}
                        onChangeText={this.onUserNameChange}
                        value={this.state.userName}
                        inputStyle={{ color: 'white' }}
                        inputContainerStyle={{ borderBottomColor: this.props.UI.backgroundColor }}
                        errorStyle={{ color: 'red' }}
                    />
                    <Input
                        placeholder='Email'
                        leftIcon={{ type: 'font-awesome', name: 'envelope', color: colors.light }}
                        onChangeText={this.onEmailChange}
                        value={this.state.email}
                        errorMessage={this.state.errorEmail}
                        inputStyle={{ color: 'white' }}
                        inputContainerStyle={{ borderBottomColor: this.props.UI.backgroundColor }}
                        errorStyle={{ color: 'red' }}
                    />
                    <Input

                        placeholder='Password'
                        leftIcon={{ type: 'font-awesome', name: 'lock', color: colors.light }}
                        onChangeText={this.onPasswordChange}
                        value={this.state.password}
                        errorMessage={this.state.errorPassword}
                        inputStyle={{ color: 'white' }}
                        inputContainerStyle={{ borderBottomColor: this.props.UI.backgroundColor,  }}
                        errorStyle={{ color: 'red' }}
                        secureTextEntry
                    />
                   
                    <TouchableOpacity style={styles.buttonContainer}
                        onPress={this.onCreateAccount}
                        disabled={this.state.loading}
                    >
                        <Text style={styles.buttonText}
                        >Register</Text>
                    </TouchableOpacity>
                    <View style={styles.signupTextCont}>
                        <Text style={styles.signupText}>Already have an account ?</Text>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')}>
                            <Text style={styles.signupButton}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
              </KeyboardAvoidingView>
            </ImageBackground>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoContainer2: {
        alignItems: 'center',
        flexGrow: 1 / 3,
        justifyContent: 'center',
    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        color: colors.gray.d,
        marginTop: 10,
        width: 160,
        textAlign: 'center',
        opacity: 0.9,
    },
    formContainer: {
        padding: 20,
    },
    buttonContainer: {
        backgroundColor: 'transparent',
        paddingVertical: 15,
        marginTop: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'white',
    },
    buttonText: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontWeight: '700',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch'
    },
    signupTextCont: {
        flexGrow: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingVertical: 16,
        flexDirection: 'row',
    },
    signupText: {
        color: colors.gray.a,
        fontSize: 16,
    },
    signupButton: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 5,
    },

});


const mapStateToProps = (store) => {
    return {
        UI: store.UI,
        User: store.User,
    }
}

export default connect(mapStateToProps)(Registration);