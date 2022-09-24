import React, { Component } from 'react'


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { MaterialCommunityIcons } from 'react-native-vector-icons';


import Profile from './Profile/Profile';
import Home from './Home';
import MyConnect from './MyConnect';
import Post from './Post';
import Notifications from './Notifications';


const Tab = createBottomTabNavigator();

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ToggleTheme } from '../../../redux/actions/UIActions'


import firebase from '../../../../firebase'

class Connect extends Component {


  


  render() {
    return (
      <Tab.Navigator initialRouteName='Home'  
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: this.props.UI.backgroundColor,
        },
        headerTintColor: this.props.UI.textColor,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveBackgroundColor: this.props.UI.backgroundColor,
        tabBarActiveTintColor: this.props.UI.colors.primary,
        tabBarInactiveBackgroundColor: this.props.UI.backgroundColor,
        tabBarInactiveTintColor: this.props.UI.textColor,
        tabBarStyle: {
          backgroundColor: this.props.UI.backgroundColor,
          flexDirection: 'row',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
        >
        <Tab.Screen name="Home" component={Home} 
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({focused, color, size }) => (
              focused ? <MaterialCommunityIcons name="home-outline" color={color} size={size} /> : <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }} />
        <Tab.Screen name="MyConnect" component={MyConnect}
          options={{
            tabBarLabel: 'MyConnect',
            tabBarIcon: ({focused, color, size }) => (
              focused ? <MaterialCommunityIcons name="account-group-outline" color={color} size={size} /> : <MaterialCommunityIcons name="account-group" color={color} size={size} />
            ),
          }} 
          />
        <Tab.Screen name="Post" component={Post}
          options={{
            tabBarLabel: 'Post',
            tabBarIcon: ({focused, color, size }) => (
              focused ? <MaterialCommunityIcons name="plus-circle-outline" color={color} size={size} /> : <MaterialCommunityIcons name="plus-circle" color={color} size={size} />
            ),
          }} />
        <Tab.Screen name="Notifications" component={Notifications}
          options={{
            tabBarLabel: 'Notifications',
            tabBarIcon: ({focused, color, size }) => (
              focused ? <MaterialCommunityIcons name="bell-outline" color={color} size={size} /> : <MaterialCommunityIcons name="bell" color={color} size={size} />
            ),
          }} />
        <Tab.Screen name="Profile" component={Profile} 
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({focused, color, size }) => (
              focused ? <MaterialCommunityIcons name="account-outline" color={color} size={size} /> : <MaterialCommunityIcons name="account" color={color} size={size} />
            ),
          }} 
          listeners={({ navigation }) => ({
            tabPress: event => {
              // Prevent default action
              event.preventDefault();
              // Do something with the `navigation` object
              navigation.navigate('Profile', { uid: this.props.User.currentUser.uid });
            },
          })}
          />
      </Tab.Navigator>
    )
  }
}



const mapStateToProps = (store) => ({
  UI : store.UI,
  User: store.User
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
  ToggleTheme
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Connect)