
import React, { useEffect, useContext } from 'react'
import { SafeAreaView, Text } from 'react-native'
import { NativeRouter, Route, Link, Routes } from 'react-router-native';
import Canva from './Canva';
import { UserContext } from './context';
import Home from './Home';
import Settings from './Settings';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
const SharedStorage = NativeModules.SharedStorage;
import { NativeModules } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function RoutesPage() {

  const { loading, setLoading } = useContext(UserContext);
  const { setMobileData } = useContext(UserContext);
  const mobileId = DeviceInfo.getUniqueId()

  useEffect(() => {
    auth().signInAnonymously().then(() => {
      database()
        .ref(`/${mobileId}`)
        .on('value', snapshot => {
          let data = snapshot.val();

          // DEVICE IS NEW
          if (!data) {
            data = { createdAt: Date.now() }
            database().ref(`/${mobileId}`).set(data)
          }

          // ORDER SENT NOTES
          if (data.sentNotes) {
            data.sentNotes = Object.values(data.sentNotes).sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)
            const widgetData = { svgInBase64: data.lastRecievedNote }
            if (Platform.OS === 'android') {
              SharedStorage.set(JSON.stringify(widgetData))
            } else {
              SharedGroupPreferences.setItem('widgetKey', widgetData, 'group.com.notetes.notetesWidget')
            }
          }

          // ORDER RECIEVED NOTES
          if (data.recievedNotes) {
            data.recievedNotes = Object.values(data.recievedNotes).sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)
          }

          // ADD TO STATE AND FINISH LOAD
          setMobileData(data);
          setLoading(false);
        })
    }
    )

  }, [])

  if (loading) {
    return (
      <SafeAreaView><Text>Loading...</Text></SafeAreaView>
    )
  }

  return (
    <NativeRouter>
      <Routes>
        <Route exact path="/canva" element={<Canva />} />
        <Route exact path="/settings" element={<Settings />} />
        <Route exact path="/" element={<Home />} />
      </Routes>
    </NativeRouter>
  )
}
