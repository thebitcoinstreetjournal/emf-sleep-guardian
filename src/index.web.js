import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('EMFSleepGuardian', () => App);

// Run the app
AppRegistry.runApplication('EMFSleepGuardian', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});