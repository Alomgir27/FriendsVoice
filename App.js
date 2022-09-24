import React , { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View,  ActivityIndicator, Platform , ImageBackground} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import firebase from './firebase';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import Login from './src/components/auth/Login';
import Registration from './src/components/auth/Registration';
import Main from './src/Main';
import ChatList from './src/components/views/Chats/ChatList';
import Chat from './src/components/views/Chats/Chat';
import CameraScreen from './src/components/views/Connect/Camera/CameraScreen';
import EditProfile from './src/components/views/Connect/Profile/EditProfile';
import PostDetails from './src/components/views/Connect/PostDetails';
import Demo from './src/components/views/Connect/Demo';

import { useFonts } from 'expo-font';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './src/redux/reducers';
import { colors } from './src/redux/constants';



const store = createStore(rootReducer, applyMiddleware(thunk));



const Stack = createStackNavigator();
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {

    if(Platform.OS !== 'web'){

    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }
  }, []);

  
  useEffect(() => {
    (async () => {
      try {
        firebase.auth().onAuthStateChanged(async (user) => {
          if (user) {
            await AsyncStorage.setItem('user', JSON.stringify(user));
            setLoggedIn(true);
            setLoaded(true);
          } else {
            const value = await AsyncStorage.getItem('user');
            console.log(value);
            if (value !== null) {
                setLoggedIn(true);
                setLoaded(true);
            }
            else {
              await AsyncStorage.removeItem('user');
              setLoggedIn(false);
              setLoaded(true);
            }
          }
        });
      } catch (error) {
        console.log(error);

      }
    })();
  }, []);

  const  registerForPushNotificationsAsync = async () =>{
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
    const user = await AsyncStorage.getItem('user');
   if(token && user){
        const { uid } = JSON.parse(user);
        firebase.firestore()
        .collection('users')
        .doc(uid)
        .update({
          token: token
        })
        .then(() => {
          console.log('User updated!');
        });
   }
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }

  const [fontsLoaded] = useFonts({
    'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
      'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
      'Diane-de-France' : require('./assets/fonts/Diane-de-France.ttf'),
      'Flyover' : require('./assets/fonts/Flyover.ttf'),
      'Grape-Drink' : require('./assets/fonts/Grape-Drink.ttf'),
      'Gratise' : require('./assets/fonts/Gratise.ttf'),
      'Kufam-SemiBoldItalic' : require('./assets/fonts/Kufam-SemiBoldItalic.ttf'),
      'Lato-BoldItalic' : require('./assets/fonts/Lato-BoldItalic.ttf'),
      'Lato-Italic' : require('./assets/fonts/Lato-Italic.ttf'),
      'My_Autery' : require('./assets/fonts/My_Autery.otf'),
      'Renatta-Signature-Italic' : require('./assets/fonts/Renatta-Signature-Italic.ttf'),
      'Renatta-Signature' : require('./assets/fonts/Renatta-Signature.ttf'),
      'AlexBrush-Regular': require('./assets/fonts/AlexBrush-Regular.ttf'),
      'Dune_Rise' : require('./assets/fonts/Dune_Rise.ttf'),
  });


    if(!loaded || !fontsLoaded) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}><ActivityIndicator size="large" /></Text>
        </View>
      )
    }

    if(!loggedIn){
      return (
        <Provider store={store}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={Login}  options={{ headerShown: false}}  />
              <Stack.Screen name="Registration" component={Registration} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
      )
    }

    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
              <Stack.Screen name="Main" component={Main} options={{ headerShown: false }} />
              <Stack.Screen name="Camera" component={CameraScreen} 
              options={{ headerShown: Platform.OS === 'android' ? false : true }} 
              />
              <Stack.Screen name="ChatList" component={ChatList}  />
              <Stack.Screen name="Chat" component={Chat}  />
              <Stack.Screen name="EditProfile" component={EditProfile}  />
              <Stack.Screen name="Login" component={Login}  options={{ headerShown: false}}  />
              <Stack.Screen name="Registration" component={Registration} options={{ headerShown: false }} />
              <Stack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false}} />
              <Stack.Screen name="Demo" component={Demo} options={{ headerShown: false}} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.dark,
  }
});
