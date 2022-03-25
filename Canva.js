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

export default () => {
  const canvasRef = useRef();
  let navigate = useNavigate();
  const [actualCache, setActualCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, onChangeText] = useState('');

  const [color, setColor] = useState(DEFAULT_COLORS[0][0][0]);
  const [thickness, setThickness] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [visibleBrushProperties, setVisibleBrushProperties] = useState(false);

  useEffect(() => {
    new Promise.all([
      AsyncStorage.getItem('actualDrawing'),
      AsyncStorage.getItem('actualText'),
    ]).then(([value1, value2]) => {
      setActualCache(value1 != null ? JSON.parse(value1) : null);
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
      'Are you sure you want to remove this beautiful box?',
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
          onPress: () => {
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
                database()
                  .ref(`/${snapshot.val().linkedWith}/recievedNotes`)
                  .push()
                  .set(infoToSave);
              });
            canvasRef.current?.clear();
            onChangeText('');
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
      <GestureHandlerRootView>
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
          <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>DRAW</Text>
          <TouchableHighlight
            onPress={sendData}
            title="New"
            color="#841584"
            accessibilityLabel="Learn more about this purple button">
            <Image
              style={{width: 21, height: 21, margin: 10}}
              source={require('./send-icon.png')}
            />
          </TouchableHighlight>
        </View>
        <Canvas
          ref={canvasRef}
          height={Dimensions.get('window').width}
          color={color}
          thickness={thickness}
          initialPaths={actualCache ? actualCache : undefined}
          opacity={opacity}
          onPathsChange={saveCache}
          simplifyOptions={{
            amount: 3,
          }}
          tool={DrawingTool.Brush}
          style={{
            borderBottomWidth: 4,
            borderColor: '#000',
            borderTopWidth: 4,
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
      <View>
        <Text>Note text: </Text>
        <TextInput
          onChangeText={t => saveTextToCache(t)}
          value={text}
          // onBlur={saveTextToCache}
          multiline
          maxLength={300}
        />
      </View>
    </SafeAreaView>
  );
};
