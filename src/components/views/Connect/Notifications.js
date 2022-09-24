import moment from 'moment'
import React from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Alert, ImageBackground, Button, FlatList } from 'react-native'


import { connect } from 'react-redux'

import firebase from '../../../../firebase'

function Notifications(props) {

  const [connectingRequests, setConnectingRequests] = React.useState([])

  React.useEffect(() => {
    setConnectingRequests(props.User.connectingRequests)
  }, [props.User.connectingRequests])
  return (
        <View style={[styles.container, { backgroundColor : props.UI.backgroundColor}]}>
          <FlatList
            data={connectingRequests}
            renderItem={({ item }) => (
              <View style={styles.connectingRequest}>
                <View style={styles.connectingRequestContent}>
                  <View style={styles.connectingRequestContentLeft}>
                    <TouchableOpacity onPress={() => props.navigation.navigate('Profile', {userId : item.user.uid, user : item.user})}>
                       <Image style={styles.connectingRequestContentLeftImage} source={{ uri: item.user.photoURL }} />
                    </TouchableOpacity>
                    <View style={styles.connectingRequestContentLeftText}>
                      <Text style={[styles.connectingRequestHeaderText, { color: props.UI.textColor}]}>{item.user.name}</Text>
                      <Text style={[styles.connectingRequestSubText, { color: props.UI.textColor}]}>{moment(item.timestamp.toDate()).fromNow()}</Text>
                    </View>
                  </View>
                  <View style={[styles.connectingRequestContentRight, {backgroundColor : props.UI. backgroundColor}]}>
                    <TouchableOpacity style={styles.connectingRequestContentRightButton} onPress={() => {
                      firebase.firestore().collection('users').doc(props.User.uid).update({
                        connectingRequests: firebase.firestore.FieldValue.arrayRemove(item)
                      })
                      firebase.firestore().collection('users').doc(item.uid).update({
                        connectingRequests: firebase.firestore.FieldValue.arrayRemove(props.User)
                      })
                      firebase.firestore().collection('users').doc(props.User.uid).update({
                        connections: firebase.firestore.FieldValue.arrayUnion(item)
                      })
                      firebase.firestore().collection('users').doc(item.uid).update({
                        connections: firebase.firestore.FieldValue.arrayUnion(props.User)
                      })
                    }
                    }>
                      <Text style={[styles.connectingRequestContentRightButtonText, {
                        color: props.UI.textColor,
                        backgroundColor: props.UI.backgroundColor,
                        borderColor: props.UI.textColor

                      }]}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.connectingRequestContentRightButton} onPress={() => {
                      firebase.firestore().collection('users').doc(props.User.uid).update({
                        connectingRequests: firebase.firestore.FieldValue.arrayRemove(item)
                      })
                      firebase.firestore().collection('users').doc(item.uid).update({
                        connectingRequests: firebase.firestore.FieldValue.arrayRemove(props.User)
                      })
                    }
                    }>
                      <Text style={[styles.connectingRequestContentRightButtonText, {
                        color: props.UI.textColor,
                        backgroundColor: props.UI.backgroundColor,
                        borderColor: props.UI.textColor
                      }]}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            keyExtractor={item => item.uid}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 
  connectingRequest: {
    flex: 1,
    justifyContent: 'space-between',

  },
  connectingRequestHeader: {
    flex: 1,
  },
  connectingRequestHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  connectingRequestContent: {
    flex: 1,
    
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  connectingRequestContentLeft: {
    flex: 1,
    // justifyContent: 'space-between',
    flexDirection: 'row'
  },
  connectingRequestContentLeftImage: {
    width: 60,
    height: 60,
    borderRadius: 35,
    marginRight: 10,
    marginTop: 10,
  },
  connectingRequestContentRight: {
    flex: 1,
    marginRight: 10,
  },
  connectingRequestContentRightButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    margin: 5
  },
  connectingRequestContentRightButtonText: {
    fontSize: 18,
  },
  connectingRequestContentLeftText: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10
  },
  connectingRequestSubText: {
    fontSize: 12,
  }

})


const  mapStateToProps = (store) => ({
  UI : store.UI,
  User : store.User,
  Users : store.Users
})

export default connect(mapStateToProps)(Notifications)