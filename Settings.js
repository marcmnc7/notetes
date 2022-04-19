/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Alert,
  Modal,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigate } from 'react-router-dom';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import styled from 'styled-components/native'
const SText = styled.Text`
  color: black;
`
export default () => {
  let navigate = useNavigate();
  const [showModalPolicies, setShowModalPolicies] = useState(false);
  const [showModalStats, setShowModalStats] = useState(false);
  const [showModalFeedback, setShowModalFeedback] = useState(false);

  const mobileId = DeviceInfo.getUniqueId();

  const unlink = async () => {
    return Alert.alert('Sure?', 'Do you want to unlink your partner?', [
      {
        text: 'Yes',
        onPress: async () => {
          let meData = await database()
            .ref(`/${mobileId}`)
            .once('value')
            .then(snapshot => snapshot.val());
          database().ref(`/${mobileId}`).update({ linkedWith: null });
          database().ref(`/${meData.linkedWith}`).update({ linkedWith: null });
          navigate('/');
        },
      },
      {
        text: 'No',
      },
    ]);
  };

  return (
    <SafeAreaView>
      <Modal
        animationType="bottom"
        transparent={true}
        visible={showModalStats}
        onRequestClose={() => {
          setShowModalStats(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                display: 'flex',
                position: 'absolute',
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <TouchableOpacity onPress={() => setShowModalStats(false)}>
                <Image
                  source={require('./close-icon.webp')}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
            <SText>Total notes sent: {}</SText>
            <SText>Total notes recieved: {}</SText>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="bottom"
        transparent={true}
        visible={showModalPolicies}
        onRequestClose={() => {
          setShowModalPolicies(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                display: 'flex',
                position: 'absolute',
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <TouchableOpacity onPress={() => setShowModalPolicies(false)}>
                <Image
                  source={require('./close-icon.webp')}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
            <SText>HERE WILL APPEAR THE POLICIES</SText>
            <SText>Privacy policy: https://www.termsfeed.com/live/0fadf9d7-dbd6-4448-bc02-330714e73c9a</SText>
            <SText>Terms and conditions: https://www.termsfeed.com/live/0ffef729-ee77-41c4-97cd-2c522389e833</SText>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="bottom"
        transparent={true}
        visible={showModalFeedback}
        onRequestClose={() => {
          setShowModalFeedback(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                display: 'flex',
                position: 'absolute',
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <TouchableOpacity onPress={() => setShowModalFeedback(false)}>
                <Image
                  source={require('./close-icon.webp')}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
            </View>
            <SText>HERE WILL APPEAR THE FEEDBACK FORM</SText>
          </View>
        </View>
      </Modal>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#FFE2E2',
        }}
      >
        <TouchableOpacity
          onPress={() => navigate('/')}
          title="Save"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        >
          <Image
            style={{ width: 40, height: 40 }}
            source={require('./back.webp')}
          />
        </TouchableOpacity>
        <SText style={{ alignSelf: 'center', fontWeight: '500' }}>SETTINGS</SText>
        <TouchableOpacity
          onPress={() => navigate('/canva')}
          title="New"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        >
          <Image
            style={{ width: 21, height: 21, margin: 10 }}
            source={require('./create-icon.webp')}
          />
        </TouchableOpacity>
      </View>
      <View style={{ display: 'flex' }}>
        {/* <TouchableOpacity
          onPress={() => setShowModalStats(true)}
          style={{borderBottomWidth: 1, padding: 15}}>
          <SText>Stats 📈</SText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowModalFeedback(true)}
          style={{borderBottomWidth: 1, padding: 15}}>
          <SText>Send feedback 😄</SText>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => setShowModalPolicies(true)}
          style={{ borderBottomWidth: 1, padding: 15 }}
        >
          <SText>Policies 🧑🏻‍⚖️</SText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={unlink}
          style={{ borderBottomWidth: 1, padding: 15 }}
        >
          <SText style={{ color: 'red', fontWeight: 'bold' }}>
            Unlink partner 🚷
          </SText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    paddingBottom: 70,
    paddingTop: 50,
    alignItems: 'center',
    shadowColor: 'gray',
    justifyContent: 'flex-start',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
});
