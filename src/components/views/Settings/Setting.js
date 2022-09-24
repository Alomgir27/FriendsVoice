import React from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Alert, ImageBackground, Button } from 'react-native'

import { MaterialCommunityIcons } from 'react-native-vector-icons'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ToggleTheme } from '../../../redux/actions/UIActions'
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from '../../../../firebase';



function Setting(props) {
  return (
      <View style={[styles.container, { backgroundColor: props.UI.backgroundColor}]}>
         
         <Button title="sign out" onPress={ async() => {
            await AsyncStorage.removeItem('user')
            .then(() => {
              firebase.auth().signOut();
              props.navigation.navigate('Login')
            })
          }} />
              
          <Button title="goto main" onPress={() => props.navigation.navigate('Login')} />

          <TouchableOpacity onPress={() => props.ToggleTheme()} style={styles.themeContainer} >
            <MaterialCommunityIcons name="theme-light-dark" size={24} color={props.UI.theme === 'dark' ? props.UI.colors.light : props.UI.colors.dark}  />
          </TouchableOpacity>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    position: 'absolute',
    bottom: 10,
    right: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 0.5,
    transform: [{scale: 1.4}]
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  }
});


const mapStateToProps = (store) => ({
  UI: store.UI
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
  ToggleTheme
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Setting)
