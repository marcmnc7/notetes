/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';

auth().signInAnonymously()

AppRegistry.registerComponent(appName, () => App);
