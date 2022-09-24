import React, {useState,  useEffect} from 'react';
import {  Button } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [audioStatus, setAudioStatus] = useState(false)
  const [sound, setSound] = useState(new Audio.Sound());
  
  useEffect(()=>{
    (async () => {
            console.log('status', audioStatus)
            if (audioStatus) {
                await sound.loadAsync('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
                try {
                    await sound.playAsync()
                } catch (e) {
                    console.log(e)
                }
            }else {
                await sound.stopAsync()
                await sound.unloadAsync()
            }
          })()
  },[audioStatus])
  
  return (
      <Button color={audioStatus ? 'red' : 'green'} title={'play'} onPress={()=>setAudioStatus(!audioStatus)} />
  );
}
