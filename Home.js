/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
import React, {useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Button,
  Image,
  TextInput,
  TouchableHighlight,
  Modal,
} from 'react-native';
import {useNavigate} from 'react-router-dom';
import {SvgXml} from 'react-native-svg';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import ViewShot, {releaseCapture} from 'react-native-view-shot';
import CameraRoll from '@react-native-community/cameraroll';
import {PermissionsAndroid, Platform} from 'react-native';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');
import {NativeModules} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import SharedGroupPreferences from 'react-native-shared-group-preferences';
const SharedStorage = NativeModules.SharedStorage;
const appGroupIdentifier = 'group.com.notetes.notetesWidget';

export default () => {
  let navigate = useNavigate();
  const [mobileId, setMobileId] = useState(DeviceInfo.getUniqueId());
  const [mobileData, setMobileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSentNotes, setShowSentNotes] = useState(true);
  const [text, onChangeText] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const shotRef = useRef();

  const widgetData = {
    text: 'dsadasdsa',
  };

  const handleSubmit = async () => {
    try {
      // iOS
      console.info(111);
      await SharedGroupPreferences.setItem(
        'widgetKey',
        widgetData,
        'group.com.notetes.notetesWidget',
      );
    } catch (error) {
      console.log({error});
    }
    // // Android
    // SharedStorage.set(JSON.stringify({text}));
  };

  useEffect(() => {
    const mD = database()
      .ref(`/${mobileId}`)
      .on('value', snapshot => {
        let data = snapshot.val();
        if (!data) {
          data = {};
          const now = Date.now();
          database().ref(`/${mobileId}`).set({createdAt: now});
          data.createdAt = now;
        }
        if (data.sentNotes) {
          data.sentNotes = Object.values(data.sentNotes).sort((a, b) =>
            a.timestamp < b.timestamp ? 1 : -1,
          );
          // SharedStorage.set(
          //   JSON.stringify({
          //     svg: data.sentNotes[0].note,
          //   }),
          // );
        }
        setMobileData(data);
        setLoading(false);
      });
    return () => database().ref(`/${mobileId}`).off('value', mD);
  }, [mobileId]);

  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  async function savePicture(picture) {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    CameraRoll.save(picture);
  }

  const link = async () => {
    const targetUser = await database()
      .ref(`/${text}`)
      .once('value')
      .then(snapshot => snapshot.val());

    if (!targetUser) {
      alert('This partner must to download the app first');
      return;
    }
    if (text === mobileId) {
      alert('This is your code. You must paste your partners code.');
      return;
    }
    if (targetUser.linkedWith) {
      alert(
        'This partner already have a user linked. Tell him unlink that first.',
      );
      return;
    }

    // Save my link
    database().ref(`/${mobileId}`).update({linkedWith: text});

    // Save other user link
    database().ref(`/${text}`).update({linkedWith: mobileId});
  };

  const saveImage = async () => {
    try {
      const uri = await shotRef.current.capture();
      console.info(uri);
      savePicture(uri);
      // console.info(111, shotRef.current);
      // releaseCapture(uri);
      setModalImage(null);
      alert('Image saved successfully');
    } catch (error) {
      console.info(error);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalImage !== null}
        onRequestClose={() => {
          setModalImage(null);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText} />
            <ViewShot
              ref={shotRef}
              style={{backgroundColor: 'white'}}
              options={{format: 'jpg'}}>
              <SvgXml xml={modalImage} />
            </ViewShot>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
                marginBottom: 10,
              }}>
              <TouchableHighlight
                style={{backgroundColor: 'blue'}}
                onPress={saveImage}>
                <Text style={styles.textStyle}>Download</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={{backgroundColor: 'blue'}}
                onPress={saveImage}>
                <Text style={styles.textStyle}>Share</Text>
              </TouchableHighlight>
            </View>
            <TouchableHighlight
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalImage(null)}>
              <Text style={styles.textStyle}>Close</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: 'white',
        }}>
        <TouchableHighlight
          onPress={() => navigate('/settings')}
          title="Save"
          color="#841584"
          accessibilityLabel="Learn more about this purple button">
          <Image
            style={{width: 20, height: 20, margin: 10}}
            source={require('./settings-icon.png')}
          />
        </TouchableHighlight>
        <Text style={{alignSelf: 'center', fontWeight: 'bold', fontSize: 15}}>
          NOTETES
        </Text>
        <TouchableHighlight
          onPress={() => navigate('/canva')}
          title="New"
          disabled={!mobileData.linkedWith}
          accessibilityLabel="Learn more about this purple button">
          <Image
            style={{width: 21, height: 21, margin: 10}}
            source={require('./create-icon.webp')}
          />
        </TouchableHighlight>
      </View>
      {!mobileData.linkedWith ? (
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            marginTop: 30,
          }}>
          <Image
            source={require('./connection-icon.png')}
            style={{width: 250, height: 200}}
          />
          <Button onPress={() => handleSubmit()} title="Test" />
          <Text style={{fontWeight: 'bold', fontSize: 30, marginBottom: 20}}>
            Connect with a partner!
          </Text>
          <Text style={{fontSize: 15, marginBottom: 10}}>Share your code:</Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <Text style={{marginBottom: 20, marginRight: 10}}>{mobileId}</Text>
            <TouchableHighlight
              style={{alignItems: 'center'}}
              onPress={() => Clipboard.setString(mobileId)}>
              <Image
                source={require('./copy-icon.png')}
                style={{width: 20, height: 20}}
              />
            </TouchableHighlight>
          </View>
          <Text style={{fontSize: 15}}>Or enter your partner's code here:</Text>
          <TextInput
            onChangeText={onChangeText}
            value={text}
            style={{
              borderBottomWidth: 1,
              width: '80%',
              alignContent: 'center',
              borderBottomColor: 'gray',
              marginBottom: 10,
              padding: 0,
            }}
          />
          <Button
            onPress={link}
            title=" Connect "
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
      ) : (
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              borderTopWidth: 1,
            }}>
            <View
              style={{
                backgroundColor: `${showSentNotes ? '#f0f0f0' : 'white'}`,
                width: '50%',
                height: '100%',
                padding: 10,
                alignItems: 'center',
              }}>
              <TouchableHighlight
                onPress={() => setShowSentNotes(false)}
                title="Recieved Notes">
                <Text>Recieved notes</Text>
              </TouchableHighlight>
            </View>
            <View
              style={{
                backgroundColor: `${showSentNotes ? 'white' : '#f0f0f0'}`,
                width: '50%',
                height: '100%',
                padding: 10,
                alignItems: 'center',
              }}>
              <TouchableHighlight
                onPress={() => setShowSentNotes(true)}
                title="Sent notes">
                <Text>Sent notes</Text>
              </TouchableHighlight>
            </View>
          </View>
          {showSentNotes ? (
            mobileData.sentNotes && (
              <ScrollView>
                <View
                  key={mobileData.sentNotes[0].timestamp}
                  style={{width: '100%', marginBottom: 10}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      padding: 10,
                    }}>{`Last note sent (${timeAgo.format(
                    mobileData.sentNotes[0].timestamp,
                  )})`}</Text>
                  <View
                    key={mobileData.sentNotes[0].timestamp}
                    style={{
                      padding: 10,
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                    <TouchableHighlight
                      onPress={() =>
                        setModalImage(mobileData.sentNotes[0].note)
                      }
                      style={{width: 200, height: 200}}>
                      <SvgXml
                        xml={mobileData.sentNotes[0].note}
                        width="100%"
                        height="100%"
                      />
                    </TouchableHighlight>
                    {mobileData.sentNotes[0].text && (
                      <Text style={{padding: 10, overflow: 'hidden'}}>
                        {mobileData.sentNotes[0].text}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={{fontSize: 16, fontWeight: 'bold', padding: 10}}>
                  Last 20 notes sent
                </Text>
                {mobileData.sentNotes.slice(1, 21).map(note => (
                  <View
                    key={note.timestamp}
                    style={{
                      borderWidth: 1,
                      margin: 10,
                      display: 'flex',
                      flexDirection: 'row',
                      position: 'relative',
                    }}>
                    <TouchableHighlight
                      onPress={() => setModalImage(note.note)}
                      style={{
                        borderWidth: 1,
                        borderColor: 'gray',
                        margin: 10,
                        width: '40%',
                        height: 100,
                      }}>
                      <SvgXml xml={note.note} width="100%" height="100%" />
                    </TouchableHighlight>
                    <Text
                      style={{padding: 10, width: '50%', overflow: 'hidden'}}>
                      {note.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )
          ) : (
            <ScrollView>
              {
                mobileData.recievedNotes
                // TODO
              }
            </ScrollView>
          )}
        </View>
      )}
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
    padding: 35,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 100,
      height: 150,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 15,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: 'red',
    position: 'absolute',
    bottom: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
