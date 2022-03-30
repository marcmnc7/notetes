/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Share,
  TouchableHighlight,
  Modal,
} from 'react-native';
import { useNavigate } from 'react-router-dom';
import { SvgXml } from 'react-native-svg';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import ViewShot, { releaseCapture } from 'react-native-view-shot';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Clipboard from '@react-native-clipboard/clipboard';
import { UserContext } from './context'
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');


export default () => {
  let navigate = useNavigate();
  const { mobileData, loading } = useContext(UserContext)
  
  const [showSentNotes, setShowSentNotes] = useState(true);
  const [text, onChangeText] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const shotRef = useRef();  
  const mobileId = DeviceInfo.getUniqueId()

  async function share() {
    try {
      const uri = await shotRef.current.capture()
      await Share.share({
        title: 'Sharing your note...',
        url: uri,
      })
      setModalImage(null)
    } catch (err) {
      console.log(err)
    }
  }

  const link = async () => {
    const targetUser = await database()
      .ref(`/${text}`)
      .once('value')
      .then(snapshot => snapshot.val())

    if (!targetUser) {
      alert('This partner must download the app first')
      return
    }
    if (text === mobileId) {
      alert('This is your code. You must paste your partners code.')
      return
    }
    if (targetUser.linkedWith) {
      alert('This partner already have a user linked. Tell him unlink that first.')
      return
    }

    // Save my link and partner link
    database().ref(`/${mobileId}`).update({ linkedWith: text });
    database().ref(`/${text}`).update({ linkedWith: mobileId });
  };

  if (loading)
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView>
      <Modal
        animationType="bottom"
        transparent={true}
        visible={modalImage !== null}
        onRequestClose={() => {
          setModalImage(null);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText} />
            <ViewShot
              ref={shotRef}
              style={{ backgroundColor: 'white' }}
              options={{ format: 'jpg' }}
            >
              <SvgXml xml={modalImage} />
            </ViewShot>
            <View
              style={{
                display: 'flex',
                position: 'absolute',
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <TouchableHighlight onPress={() => share()}>
                <Image
                  source={require('./share-icon.webp')}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableHighlight>
              <TouchableHighlight onPress={() => setModalImage(null)}>
                <Image
                  source={require('./close-icon.webp')}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableHighlight>
            </View>
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
        <TouchableHighlight
          onPress={() => navigate('/settings')}
          title="Save"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        >
          <Image
            style={{ width: 20, height: 20, margin: 10 }}
            source={require('./settings-icon.png')}
          />
        </TouchableHighlight>
        <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 15 }}>
          NOTETES
        </Text>
        <TouchableHighlight
          onPress={() => navigate('/canva')}
          title="New"
          disabled={!mobileData.linkedWith}
          accessibilityLabel="Learn more about this purple button"
        >
          <Image
            style={{ width: 21, height: 21, margin: 10 }}
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
          }}
        >
          <Text style={{ fontSize: 60, fontWeight: 'bold' }}>First...</Text>
          <Text style={{ marginBottom: 20, fontWeight: '200' }}>
            CONNECT WITH A PARTNER!
          </Text>

          <Image
            source={require('./link-icon.png')}
            style={{ width: 250, height: 200 }}
          />
          <Text style={{ fontSize: 15, marginBottom: 10, fontWeight: '200' }}>
            Share your code
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <Text style={{ marginBottom: 20, marginRight: 10 }}>
              {mobileId}
            </Text>
            <TouchableHighlight
              style={{ alignItems: 'center' }}
              onPress={() => Clipboard.setString(mobileId)}
            >
              <Image
                source={require('./copy-icon.png')}
                style={{ width: 20, height: 20 }}
              />
            </TouchableHighlight>
          </View>
          <Text style={{ fontWeight: '100' }}>|</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 30, color: '#FFE2E2' }}>
            OR
          </Text>
          <Text style={{ fontWeight: '100', marginBottom: 10 }}>|</Text>
          <Text
            style={{
              fontSize: 15,
              padding: 10,
              fontWeight: '200',
              marginBottom: 0,
            }}
          >
            Enter your partner's code
          </Text>
          <TextInput
            onChangeText={onChangeText}
            value={text}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              width: '70%',
              height: 30,
              paddingLeft: 10,
              marginBottom: 20,
              textAlign: 'center',
              backgroundColor: '#e3e3e3',
            }}
          />
          <TouchableHighlight
            onPress={link}
            title="Connect"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
            style={{
              backgroundColor: 'white',
              width: '50%',
              borderWidth: 1,
              borderRadius: 50,
              display: 'flex',
              alignItems: 'center',
              padding: 10,
            }}
          >
            <Text>Connect</Text>
          </TouchableHighlight>
        </View>
      ) : (
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <View
              style={{
                backgroundColor: `${showSentNotes ? '#f0f0f0' : 'white'}`,
                width: '50%',
                height: '100%',
                padding: 10,
                alignItems: 'center',
              }}
            >
              <TouchableHighlight
                onPress={() => setShowSentNotes(false)}
                title="Recieved Notes"
              >
                <Text>📩 Recieved notes</Text>
              </TouchableHighlight>
            </View>
            <View
              style={{
                backgroundColor: `${showSentNotes ? 'white' : '#f0f0f0'}`,
                width: '50%',
                height: '100%',
                padding: 10,
                alignItems: 'center',
              }}
            >
              <TouchableHighlight
                onPress={() => setShowSentNotes(true)}
                title="Sent notes"
              >
                <Text>📤 Sent notes</Text>
              </TouchableHighlight>
            </View>
          </View>
          {showSentNotes
            ? mobileData.sentNotes && (
                <ScrollView>
                  <View
                    key={mobileData.sentNotes[0].timestamp}
                    style={{ width: '100%', marginBottom: 10 }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '500',
                        padding: 10,
                        textAlign: 'center',
                      }}
                    >
                      Last note
                    </Text>
                    <Text
                      style={{
                        fontWeight: '200',
                        color: 'gray',
                        textAlign: 'center',
                        paddingTop: 0,
                        marginTop: 0,
                      }}
                    >
                      {timeAgo.format(mobileData.sentNotes[0].timestamp)}
                    </Text>
                    <View
                      key={mobileData.sentNotes[0].timestamp}
                      style={{
                        padding: 10,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <TouchableHighlight
                        onPress={() =>
                          setModalImage(mobileData.sentNotes[0].note)
                        }
                        style={{ width: 200, height: 200 }}
                      >
                        <SvgXml
                          xml={mobileData.sentNotes[0].note}
                          width="100%"
                          height="100%"
                        />
                      </TouchableHighlight>
                      {mobileData.sentNotes[0].text && (
                        <Text style={{ padding: 10, overflow: 'hidden' }}>
                          {mobileData.sentNotes[0].text}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '200',
                      padding: 10,
                      textAlign: 'center',
                      backgroundColor: '#f0f0f0',
                    }}
                  >
                    - Last 20 notes sent -
                  </Text>
                  {mobileData.sentNotes.slice(1, 21).map(note => (
                    <View key={note.timestamp}>
                      <Text
                        style={{
                          fontWeight: '100',
                          color: 'gray',
                          textAlign: 'left',
                          paddingLeft: 10,
                          paddingTop: 10,
                          paddingBottom: 0,
                        }}
                      >
                        {timeAgo.format(note.timestamp)}
                      </Text>
                      <View
                        style={{
                          margin: 10,
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <TouchableHighlight
                          onPress={() => setModalImage(note.note)}
                          style={{
                            width: '40%',
                            height: 150,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <SvgXml xml={note.note} width="100%" height="100%" />
                        </TouchableHighlight>
                        <Text
                          style={{
                            display: 'flex',
                            flexShrink: 1,
                            paddingLeft: 10,
                            overflow: 'hidden',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          {note.text ||
                            'No textdsadasndjksadnkjasdasdsadoñasd ahiopd sajiod jasiod jasiod jasio djasiod jsaiod jsaiod jsaiopdhjasdnhasji dhjias dais aaaaaaaa dipsah bbbbbbbbbbbbbbbbbbbb duisah dusiah dsauih njdsand sahdjias hdjasi dhsaui dhasui dhsauid hasuid hasuidh sauidh sauidh asuidh asid'}
                        </Text>
                      </View>
                      <View
                        style={{
                          borderBottomColor: '#e3e3e3',
                          borderBottomWidth: 1,
                        }}
                      />
                    </View>
                  ))}
                </ScrollView>
              )
            : mobileData.recievedNotes && (
                <ScrollView>
                  <View
                    key={mobileData.recievedNotes[0].timestamp}
                    style={{ width: '100%', marginBottom: 10 }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '500',
                        padding: 10,
                        textAlign: 'center',
                      }}
                    >
                      Last note
                    </Text>
                    <Text
                      style={{
                        fontWeight: '200',
                        color: 'gray',
                        textAlign: 'center',
                        paddingTop: 0,
                        marginTop: 0,
                      }}
                    >
                      {timeAgo.format(mobileData.recievedNotes[0].timestamp)}
                    </Text>
                    <View
                      key={mobileData.recievedNotes[0].timestamp}
                      style={{
                        padding: 10,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <TouchableHighlight
                        onPress={() =>
                          setModalImage(mobileData.recievedNotes[0].note)
                        }
                        style={{ width: 200, height: 200 }}
                      >
                        <SvgXml
                          xml={mobileData.recievedNotes[0].note}
                          width="100%"
                          height="100%"
                        />
                      </TouchableHighlight>
                      {mobileData.recievedNotes[0].text && (
                        <Text style={{ padding: 10, overflow: 'hidden' }}>
                          {mobileData.recievedNotes[0].text}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '200',
                      padding: 10,
                      textAlign: 'center',
                      backgroundColor: '#f0f0f0',
                    }}
                  >
                    - Last 20 notes sent -
                  </Text>
                  {mobileData.recievedNotes.slice(1, 21).map(note => (
                    <View key={note.timestamp}>
                      <Text
                        style={{
                          fontWeight: '100',
                          color: 'gray',
                          textAlign: 'left',
                          paddingLeft: 10,
                          paddingTop: 10,
                          paddingBottom: 0,
                        }}
                      >
                        {timeAgo.format(note.timestamp)}
                      </Text>
                      <View
                        style={{
                          margin: 10,
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <TouchableHighlight
                          onPress={() => setModalImage(note.note)}
                          style={{
                            width: '40%',
                            height: 150,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <SvgXml xml={note.note} width="100%" height="100%" />
                        </TouchableHighlight>
                        <Text
                          style={{
                            display: 'flex',
                            flexShrink: 1,
                            paddingLeft: 10,
                            overflow: 'hidden',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          {note.text ||
                            'No textdsadasndjksadnkjasdasdsadoñasd ahiopd sajiod jasiod jasiod jasio djasiod jsaiod jsaiod jsaiopdhjasdnhasji dhjias dais aaaaaaaa dipsah bbbbbbbbbbbbbbbbbbbb duisah dusiah dsauih njdsand sahdjias hdjasi dhsaui dhasui dhsauid hasuid hasuidh sauidh sauidh asuidh asid'}
                        </Text>
                      </View>
                      <View
                        style={{
                          borderBottomColor: '#e3e3e3',
                          borderBottomWidth: 1,
                        }}
                      />
                    </View>
                  ))}
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
