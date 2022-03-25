/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, View, Button, Image, TouchableHighlight} from 'react-native';
import {useNavigate} from 'react-router-dom';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';

export default () => {
  let navigate = useNavigate();

  const mobileId = DeviceInfo.getUniqueId();

  const unlink = async () => {
    let meData = await database()
      .ref(`/${mobileId}`)
      .once('value')
      .then(snapshot => snapshot.val());
    database().ref(`/${mobileId}`).update({linkedWith: null});
    database().ref(`/${meData.linkedWith}`).update({linkedWith: null});
    navigate('/');
  };

  return (
    <View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <TouchableHighlight
          onPress={() => navigate('/')}
          title="Save"
          color="#841584"
          accessibilityLabel="Learn more about this purple button">
          <Image
            style={{width: 40, height: 40}}
            source={require('./back.webp')}
          />
        </TouchableHighlight>
        <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>SETTINGS</Text>
        <TouchableHighlight
          onPress={() => navigate('/canva')}
          title="New"
          color="#841584"
          accessibilityLabel="Learn more about this purple button">
          <Image
            style={{width: 21, height: 21, margin: 10}}
            source={require('./create-icon.webp')}
          />
        </TouchableHighlight>
      </View>
      <View style={{display: 'flex'}}>
        <Text>Policies</Text>
        <Button
          onPress={unlink}
          title="Unlink partner"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />

        <Text>Export all photos</Text>
      </View>
    </View>
  );
};
