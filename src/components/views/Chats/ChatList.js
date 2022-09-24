import React, { useState, useEffect} from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Alert, ImageBackground, FlatList } from 'react-native'


import { MaterialCommunityIcons } from 'react-native-vector-icons';

import { connect } from 'react-redux'

import firebase from '../../../../firebase'

import moment from 'moment';

function ChatList(props) {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [chatList, setChatList] = useState([])

  useEffect(() => {
   props.navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{marginRight: 10}} onPress={() => props.navigation.navigate('Profile', {uid : props.User.currentUser.uid})}>
          <MaterialCommunityIcons name="account-circle" size={30} color={props.UI.textColor} />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity style={{marginLeft: 10}} onPress={() => props.navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={30} color={props.UI.textColor} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: props.UI.backgroundColor,
      },
      headerTintColor: props.UI.textColor,
      headerTitle: 'Chats',
    })
  }, [])

  

  useEffect(() => {
    setChatList(props.User.chatList)
    console.log(props.User.chatList)
  }, [props.User.chatList])



  return (
    <View style={[styles.containerBox, { backgroundColor : props.UI.backgroundColor}]}>
        <FlatList
        data={chatList}
        listKey={(item, index) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.container, {backgroundColor: props.UI.backgroundColor}]}
            onPress={() => props.navigation.navigate('Chat', { item })}
            key={item.id}
          >
            <View style={styles.imageContainer}>
              <Image
                style={styles.image}
                source={{ uri: item.user.photoURL }}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.name,  { color : props.UI.textColor}]}>{item.user.name}</Text>
              <Text style={[styles.lastMessage, { color : props.UI.textColor}]}>{item.lastMessage}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={[styles.time, { color : props.UI.textColor}]}>{moment(item.timestamp.toDate()).format('LT')}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}


const styles = StyleSheet.create({
  containerBox: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 10
  },
  image: {
    width: '100%',
    height: '100%'
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  lastMessage: {
    fontSize: 14,
    color: '#666'
  },
  timeContainer: {
    width: 50,
    alignItems: 'flex-end'
  },
  time: {
    fontSize: 12,
    color: '#666'
  }
});


const mapStateToProps = (store) => ({
  UI: store.UI,
  User: store.User,
  Users : store.Users
});


export default connect(mapStateToProps)(ChatList);

