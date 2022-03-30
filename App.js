/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState, useEffect } from 'react';
import { View } from 'react-native';
import { NativeRouter, Route, Link, Routes } from 'react-router-native';
import Canva from './Canva';
import Home from './Home';
import Settings from './Settings';
import { UserContext } from './context'
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { NativeModules } from 'react-native';
const SharedStorage = NativeModules.SharedStorage;

export default () => {

  const [ mobileData, setMobileData ] = useState({})
  const [ loading, setLoading ] = useState(true)
  const mobileId = DeviceInfo.getUniqueId()

  useEffect(() => {
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
          data.sentNotes = Object.values(data.sentNotes).sort((a, b) => a.timestamp < b.timestamp ? 1 : -1 )
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
      });
  }, [])
  


  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <NativeRouter>
        <UserContext.Provider value={{ mobileData, loading }}>
          <Routes>
            <Route exact path="/canva" element={<Canva />} />
            <Route exact path="/settings" element={<Settings />} />
            <Route exact path="/" element={<Home />} />
          </Routes>
        </UserContext.Provider>
      </NativeRouter>
    </View>
  );
};
