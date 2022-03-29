/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  Alert,
  Button,
  Modal,
  Image,
  TouchableHighlight,
  SafeAreaView,
} from 'react-native';
import {useNavigate} from 'react-router-dom';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';

export default () => {
  let navigate = useNavigate();
  const [showModalPolicies, setShowModalPolicies] = useState(false);
  const [showModalStats, setShowModalStats] = useState(false);
  const [showModalFeedback, setShowModalFeedback] = useState(false);

  const mobileId = DeviceInfo.getUniqueId();

  const unlink = async () => {
    return Alert.alert(
      'Are your sure?',
      'Do you want to unlink your partner?',
      [
        {
          text: 'Yes',
          onPress: async () => {
            let meData = await database()
              .ref(`/${mobileId}`)
              .once('value')
              .then(snapshot => snapshot.val());
            database().ref(`/${mobileId}`).update({linkedWith: null});
            database().ref(`/${meData.linkedWith}`).update({linkedWith: null});
            navigate('/');
          },
        },
        {
          text: 'No',
        },
      ],
    );
  };

  return (
    <SafeAreaView>
      <Modal
        animationType="bottom"
        transparent={true}
        visible={showModalStats}
        onRequestClose={() => {
          setShowModalStats(false);
        }}>
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
              }}>
              <TouchableHighlight onPress={() => setShowModalStats(false)}>
                <Image
                  source={require('./close-icon.webp')}
                  style={{width: 30, height: 30}}
                />
              </TouchableHighlight>
            </View>
            <Text>Total notes sent: {}</Text>
            <Text>Total notes recieved: {}</Text>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="bottom"
        transparent={true}
        visible={showModalPolicies}
        onRequestClose={() => {
          setShowModalPolicies(false);
        }}>
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
              }}>
              <TouchableHighlight onPress={() => setShowModalPolicies(false)}>
                <Image
                  source={require('./close-icon.webp')}
                  style={{width: 30, height: 30}}
                />
              </TouchableHighlight>
            </View>
            <Text>HERE WILL APPEAR THE POLICIES</Text>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="bottom"
        transparent={true}
        visible={showModalFeedback}
        onRequestClose={() => {
          setShowModalFeedback(false);
        }}>
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
              }}>
              <TouchableHighlight onPress={() => setShowModalFeedback(false)}>
                <Image
                  source={require('./close-icon.webp')}
                  style={{width: 30, height: 30}}
                />
              </TouchableHighlight>
            </View>
            <Text>HERE WILL APPEAR THE FEEDBACK FORM</Text>
          </View>
        </View>
      </Modal>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#FFE2E2',
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
        <Text style={{alignSelf: 'center', fontWeight: '500'}}>SETTINGS</Text>
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
        {/* <TouchableHighlight
          onPress={() => setShowModalStats(true)}
          style={{borderBottomWidth: 1, padding: 15}}>
          <Text>Stats 📈</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => setShowModalFeedback(true)}
          style={{borderBottomWidth: 1, padding: 15}}>
          <Text>Send feedback 😄</Text>
        </TouchableHighlight> */}
        <TouchableHighlight
          onPress={() => setShowModalPolicies(true)}
          style={{borderBottomWidth: 1, padding: 15}}>
          <Text>Policies 🧑🏻‍⚖️</Text>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={unlink}
          style={{borderBottomWidth: 1, padding: 15}}>
          <Text style={{color: 'red', fontWeight: 'bold'}}>Unlink partner 🚷</Text>
        </TouchableHighlight>
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
