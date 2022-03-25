/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeRouter, Route, Link, Routes} from 'react-router-native';
import Canva from './Canva';
import Home from './Home';
import Settings from './Settings';

export default () => {
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <NativeRouter>
        <Routes>
          <Route exact path="/canva" element={<Canva />} />
          <Route exact path="/settings" element={<Settings />} />
          <Route exact path="/" element={<Home />} />
        </Routes>
      </NativeRouter>
    </View>
  );
};
