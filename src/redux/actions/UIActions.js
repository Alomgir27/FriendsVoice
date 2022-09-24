import { TOGGLE_THEME } from "../constants";
import { INITIATE_THEME } from "../constants";
import { RELOAD_DATA_STATE_CHANGE } from "../constants";
import firebase from '../../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';





export function ToggleTheme(){
    return (async(dispatch) => {
        const user = await AsyncStorage.getItem('user');
        if(user) {
        const { uid } = JSON.parse(user);
        dispatch({ type: TOGGLE_THEME });
        firebase
            .firestore()
            .collection("users")
            .doc(uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    const user = doc.data();
                    firebase
                        .firestore()
                        .collection("users")
                        .doc(uid)
                        .update({
                            theme: user.theme === "light" ? "dark" : "light",
                        })
                        .then(() => {
                           console.log('toggle');
                        })
                        .catch((err) => {
                            console.log(err);
                           
                        });
                }
            })
        
        }
        
    });
}

