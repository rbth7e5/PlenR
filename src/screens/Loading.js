import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

export default class Loading extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Why do you have so many events to load >_></Text>
        <ActivityIndicator size='large' color='#000'/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  text: {
    flex: 1,
    fontSize: 20,
    padding: 20,
    fontWeight: '900',
    color: 'hsla(0, 0%, 0%, 0.4)',
    textAlign: 'center',
  },
})
