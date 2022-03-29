/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Image,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigate} from 'react-router-dom';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Canvas, DrawingTool} from '@benjeau/react-native-draw';
import {
  BrushProperties,
  CanvasControls,
  DEFAULT_COLORS,
} from '@benjeau/react-native-draw-extras';
import ViewShot from 'react-native-view-shot';
import {SvgXml} from 'react-native-svg';
var RNFS = require('react-native-fs');

export default () => {
  const canvasRef = useRef();
  let navigate = useNavigate();
  const [actualDraw, setActualDraw] = useState([]);
  const [text, onChangeText] = useState('');
  const [loading, setLoading] = useState(true);

  const [color, setColor] = useState(DEFAULT_COLORS[0][0][0]);
  const [thickness, setThickness] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [visibleBrushProperties, setVisibleBrushProperties] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const shotRef = useRef();

  useEffect(() => {
    new Promise.all([
      AsyncStorage.getItem('actualDrawing'),
      AsyncStorage.getItem('actualText'),
    ]).then(([value1, value2]) => {
      setActualDraw(value1 != null ? JSON.parse(value1) : null);
      onChangeText(value2);
      setLoading(false);
    });
  }, []);

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleClear = () => {
    return Alert.alert(
      'Are your sure?',
      'Are you sure you want to clean this note?',
      [
        {
          text: 'Yes',
          onPress: () => {
            canvasRef.current?.clear();
            saveTextToCache('');
          },
        },
        {
          text: 'No',
        },
      ],
    );
  };

  const [overlayOpacity] = useState(new Animated.Value(0));
  const handleToggleBrushProperties = () => {
    if (!visibleBrushProperties) {
      setVisibleBrushProperties(true);

      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setVisibleBrushProperties(false);
      });
    }
  };

  const handleChangeColor = color => {
    setColor(color);
    setVisibleBrushProperties(false);
  };

  const saveCache = a => {
    AsyncStorage.setItem('actualDrawing', JSON.stringify(a));
  };
  const saveTextToCache = t => {
    AsyncStorage.setItem('actualText', t);
    onChangeText(t);
  };

  const sendData = () => {
    Alert.alert(
      'Are your sure?',
      'Are you sure you want to send this note to the partner?',
      [
        // The "Yes" button
        {
          text: 'Yes',
          onPress: async () => {
            const svgData = canvasRef.current?.getSvg();
            const infoToSave = {
              note: svgData,
              timestamp: Date.now(),
              text: text,
            };
            // Save to my sent notes
            database()
              .ref(`/${DeviceInfo.getUniqueId()}/sentNotes`)
              .push()
              .set(infoToSave);
            // Save to him recieved notes
            database()
              .ref(`/${DeviceInfo.getUniqueId()}`)
              .once('value')
              .then(snapshot => {
                console.info(111, snapshot.val().linkedWith);
                database()
                  .ref(`/${snapshot.val().linkedWith}/recievedNotes`)
                  .push()
                  .set(infoToSave);
              });
            // Open modal, read image in b64 and save to lastrecieved note
            setModalImage(svgData);
            const uri = await shotRef.current.capture();
            const base64Image = await RNFS.readFile(uri, 'base64');
            database()
              .ref(`/${DeviceInfo.getUniqueId()}`)
              .once('value')
              .then(snapshot => {
                database()
                  .ref(`/${snapshot.val().linkedWith}/lastRecievedNote`)
                  .set(base64Image);
              });
            canvasRef.current?.clear();
            setModalImage(null);
            saveTextToCache('');
            navigate('/');
          },
        },
        {
          text: 'No',
        },
      ],
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalImage !== null}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Sending...</Text>
            <ViewShot
              ref={shotRef}
              style={{backgroundColor: 'white'}}
              options={{format: 'jpg'}}>
              <SvgXml xml={modalImage} />
            </ViewShot>
          </View>
        </View>
      </Modal>
      <GestureHandlerRootView>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
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
          <Text style={{alignSelf: 'center', fontWeight: '500'}}>CREATION</Text>
          <TouchableHighlight
            onPress={sendData}
            title="New"
            color="#841584"
            accessibilityLabel="Learn more about this purple button">
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                margin: 10,
              }}>
              <Text>Send</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View
          style={{
            marginTop: 5,
            marginBottom: 5,
            display: 'flex',
            alignItems: 'center',
          }}>
          <TextInput
            onChangeText={t => saveTextToCache(t)}
            value={text}
            placeholder="✍🏻 Add some caption here (optional)"
            multiline
            height={30}
            style={{paddingLeft: 10, paddingRight: 10}}
            maxLength={300}
          />
        </View>
        <Canvas
          ref={canvasRef}
          height={Dimensions.get('window').width}
          color={color}
          thickness={thickness}
          initialPaths={actualDraw || undefined}
          opacity={opacity}
          onPathsChange={saveCache}
          simplifyOptions={{
            amount: 3,
          }}
          tool={DrawingTool.Brush}
          style={{
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: '#e3e3e3',
          }}
        />

        <View>
          <CanvasControls
            onUndo={handleUndo}
            onClear={handleClear}
            // onToggleEraser={handleToggleBrushProperties}
            onToggleBrushProperties={handleToggleBrushProperties}
            tool={DrawingTool.Brush}
            color={color}
            opacity={opacity}
            thickness={thickness}
          />
          {visibleBrushProperties && (
            <BrushProperties
              color={color}
              thickness={thickness}
              opacity={opacity}
              onColorChange={color => handleChangeColor(color)}
              onThicknessChange={setThickness}
              onOpacityChange={setOpacity}
              style={{
                position: 'absolute',
                bottom: 80,
                left: 0,
                right: 0,
                padding: 10,
                backgroundColor: '#ededed',
                borderTopEndRadius: 10,
                borderTopStartRadius: 10,
                borderWidth: StyleSheet.hairlineWidth,
                borderBottomWidth: 0,
                borderTopColor: '#b0b0b0',
                opacity: overlayOpacity,
              }}
            />
          )}
        </View>
      </GestureHandlerRootView>
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
