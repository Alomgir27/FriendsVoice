import React, { Component } from 'react'

import { Image, Platform, StyleSheet, TouchableOpacity} from 'react-native'
import { ActivityIndicator, View, Text, ImageBackground, StatusBar } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context';


import Connect from './components/views/Connect/Connect';
import Educative from './components/views/Educative/Educative';
import Notes from './components/views/Notes/Notes';
import Notifications from './components/views/Notifications/Notifications';
import Setting from './components/views/Settings/Setting';



import { createDrawerNavigator } from '@react-navigation/drawer'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchUser } from './redux/actions/UserActions';
import { fetchUserConnecting } from './redux/actions/UserActions';
import { fetchUserConnected } from './redux/actions/UserActions';
import { fetchUserPosts } from './redux/actions/UserActions';
import { fetchUsersPosts } from './redux/actions/UserActions';
import { ToggleTheme } from './redux/actions/UIActions';
import { ReloadData } from './redux/actions/UserActions';
import { fetchUserConnectingRequests } from './redux/actions/UserActions';



import { MaterialCommunityIcons } from 'react-native-vector-icons';


const Drawer = createDrawerNavigator();
class Main extends Component {

  
  
  componentDidMount() {
    this.props.fetchUser();
    this.props.fetchUserConnected();
    this.props.fetchUserConnecting();
    this.props.fetchUserConnectingRequests();
    this.props.fetchUserPosts();
    this.props.fetchUsersPosts();
  }

  render() {
    const { loading, reload } = this.props.UI;
    if(reload){
      if(Platform.OS !== 'web'){
        return (
          <ImageBackground source={require('../assets/images/FriendsVoice15.png')} style={styles.backgroundImage}>
          <View style={styles.container}>
            <Text style={styles.textTitle}>Something went wrong</Text>
            <Text style={styles.text}>We're having issues loading this app</Text>
            <TouchableOpacity onPress={() => this.props.ReloadData()} style={styles.button}>
              <Text style={styles.textButton}>Reload</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
        )
      } else {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.props.ReloadData()} style={{ width: 50, height: 50, borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 0.5, transform: [{scale: 1.4}] }} >
                <MaterialCommunityIcons name="reload" size={24} color={this.props.UI.colors.primary}  />
              </TouchableOpacity>
          </View>
      )
    }
   }

    if(loading) {
      return (
        <View style={styles.containerLoader}>
          <Text style={styles.text}><ActivityIndicator size="large" /></Text>
        </View>
      )
    }

    return (
       <SafeAreaView style={{ flex : 1}} >
        <StatusBar barStyle={{
          dark: 'light-content',
          light: 'dark-content'
        }[this.props.UI.theme]} backgroundColor={this.props.UI.backgroundColor} />

         <Drawer.Navigator initialRouteName='Connect'
          screenOptions={{
            headerStyle: {
              backgroundColor: this.props.UI.backgroundColor,
            },
            headerTintColor: this.props.UI.textColor,
            drawerActiveBackgroundColor: this.props.UI.backgroundColor,
            drawerActiveTintColor: this.props.UI.theme === 'dark' ?  this.props.UI.colors.primary :  this.props.UI.colors.info,
            drawerInactiveBackgroundColor: this.props.UI.backgroundColor,
            drawerInactiveTintColor: this.props.UI.textColor,
            drawerStyle: {
              backgroundColor: this.props.UI.backgroundColor,
              flexDirection: 'row',
            },
            drawerLabelStyle: {
              fontSize: 12,
            },
            headerStatusBarHeight: 0,
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 25,
              fontFamily: 'AlexBrush-Regular',
            },
            headerLeftContainerStyle: {
              paddingLeft: 20,
            },
            headerRightContainerStyle: {
              paddingRight: 20,
            },
            headerRight: () => (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatList')}>
                <Image source={this.props.UI.theme === 'dark' ? require('../assets/logo/lightIcon.png') : require('../assets/logo/darkIcon.png')} style={{ width:35, height: 35}} />
              </TouchableOpacity>
            ),
          }}
        >
          <Drawer.Screen name="Connect" component={Connect}
            options={{
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account-group" color={color} size={size} />
              ),
              drawerLabelStyle: {
                fontSize: 12,
              },
            }}
          />
          <Drawer.Screen name="Educative" component={Educative} 
            options={{
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen name="Notes" component={Notes} 
            options={{
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="notebook" color={color} size={size} />
              ),
              drawerLabelStyle: {
                fontSize: 12,
              },
            }}
          />
          <Drawer.Screen name="Notifications" component={Notifications} 
            options={{
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="bell" color={color} size={size} />
              ),
              drawerLabelStyle: {
                fontSize: 12,
              },
            }}
          />
          <Drawer.Screen name="Setting" component={Setting} 
            options={{
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cog" color={color} size={size} />
              ),
              drawerLabelStyle: {
                fontSize: 12,
              },
            }}
          />
        </Drawer.Navigator>
      </SafeAreaView>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '60%',
  },
  text: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    width: 'auto',
    height: 'auto',
    borderRadius: 10,
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 0.5,
  },
  textTitle: {
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
  },
  textButton: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderRadius: 18,
    marginTop: 10,
    borderColor: '#fff',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  containerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})


const mapStateToProps = (store) => {
  return {
    UI: store.UI
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ 
     fetchUser,
     fetchUserConnecting,
     fetchUserConnected,
     fetchUserPosts,
     ReloadData,
     ToggleTheme,
     fetchUserConnectingRequests,
     fetchUsersPosts
    
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
