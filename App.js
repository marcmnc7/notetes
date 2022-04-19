/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useContext } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { NativeRouter, Route, Link, Routes } from 'react-router-native';
import Canva from './Canva';
import Home from './Home';
import Settings from './Settings';
import RoutesPage from './RoutesPage';
import { UserContext } from './context'
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { NativeModules } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
const SharedStorage = NativeModules.SharedStorage;

export default () => {

  const [mobileData, setMobileData] = useState({})
  const [loading, setLoading] = useState(true)


  return (
    <UserContext.Provider value={{ mobileData, setMobileData, loading, setLoading }}>
      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
        <RoutesPage />
      </ScrollView>
    </UserContext.Provider>
  );
};
